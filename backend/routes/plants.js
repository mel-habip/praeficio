"use strict"
import express from 'express';
import authenticateToken from '../jobs/authenticateToken.js';
import PlantService from '../modules/PlantService.mjs';
import multer from 'multer';

import {
    uploadToS3,
    fetchFromS3,
} from '../utils/s3_connection.js';

const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const daysOfTheMonthMap = {};
for (let i = 1; i < 32; i++) {
    daysOfTheMonthMap[i] = true;
};


const plantRouter = express.Router();
plantRouter.use(authenticateToken);

const storage = multer.memoryStorage()
const upload = multer({
    storage
});

const helper = new PlantService();

// get all of the user's plants with their images
plantRouter.get('/', async (req, res) => {
    const includeInactive = req.query.includeInactive === 'true';

    const recordCreation = await helper.fetch_by_user_id(req.user.id, includeInactive ? null : true);

    if (!recordCreation?.success) return res.status(422).json({
        message: `Failed to fetch.`
    });

    const plantImagesArray = recordCreation.details.map(plant => {
        if (plant.file_name) {
            return fetchFromS3(plant.file_name);
        } else {
            return new Promise((resolve, _) => resolve(''));
        }
    });

    Promise.all(plantImagesArray).then((imageURLs) => {
        const finalResult = [];
        imageURLs.forEach((url, index) => {
            finalResult.push({
                ...recordCreation.details[index],
                url,
            });
        });
        return res.status(200).json({
            data: finalResult,
            count: finalResult.count,
        });
    }).catch(() => {
        return res.status(422).json({
            message: `Failed to handle images.`
        });
    });
});

// creates a single plant record
plantRouter.post('/', upload.single('file'), async (req, res) => {

    const scheduleDescription = {
        pattern: req.body.pattern,
    };

    try {
        scheduleDescription[req.body.pattern] = JSON.parse(req.body[req.body.pattern]);
    } catch {
        return res.status(400).json({
            message: 'Could not read Schedule description'
        });
    }

    const validationResults = validateScheduleDescription(scheduleDescription);

    if (validationResults.length) return res.status(400).json({
        message: 'Bad Schedule Description',
        validationResults,
    });

    let active;

    if (req.body.active === 'true') {
        active = true;
    } else if (req.body.active === 'false') {
        active = false;
    }

    const file = req.file;

    let uploadedFile;

    if (file) {
        uploadedFile = await uploadToS3(file.buffer, file.mimetype);
    }

    const recordCreation = await helper.create_single({
        name: req.body.name,
        description: req.body.description,
        user_id: req.user.id,
        file_name: uploadedFile?.name_used,
        schedule: JSON.stringify(scheduleDescription),
        active: active ?? true,
    });

    if (recordCreation.success) return res.status(200).json(recordCreation.details);

    return res.status(422).json({
        message: `Failed to create.`
    });
});

plantRouter.get(`/watering/`, async (req, res) => {
    let selectedDate = req.query.selectedDate;

    if (!selectedDate) {
        selectedDate = new Date();
    } else {
        selectedDate = validateAndConvertDate(selectedDate);
        if (!selectedDate) selectedDate = new Date();
    }

    const recordsFetch = await helper.fetch_by_user_id(req.user.id);

    if (!recordsFetch?.success) return res.status(422).json({
        message: `Failed to fetch.`
    });

    const plantsThatNeedToBeWateredOnSelectedDate = recordsFetch.details.filter(plant => {
        if (!plant.active) return;

        let scheduleDescription = {
            ...plant.schedule,
            created_on: plant.created_on
        };

        return shouldEventOccur(scheduleDescription, selectedDate);
    });


    const plantImagesArray = plantsThatNeedToBeWateredOnSelectedDate.map(plant => {
        if (plant.file_name) {
            return fetchFromS3(plant.file_name);
        } else {
            return new Promise((resolve, _) => resolve(''));
        }
    });

    Promise.all(plantImagesArray).then((imageURLs) => {
        const finalResult = [];
        imageURLs.forEach((url, index) => {
            finalResult.push({
                ...plantsThatNeedToBeWateredOnSelectedDate[index],
                url,
            });
        });
        return res.status(200).json({
            data: finalResult,
            count: finalResult.count,
            selectedDate: selectedDate.toLocaleString('en-CA'),
        });
    }).catch(() => {
        return res.status(422).json({
            message: `Failed to handle images.`
        });
    });
});

plantRouter.put('/:plant_id', upload.single('file'), async (req, res) => {

    const scheduleDescription = req.body.pattern ? {
        pattern: req.body.pattern,
    } : null;

    if (scheduleDescription) {
        try {
            scheduleDescription[req.body.pattern] = JSON.parse(req.body[req.body.pattern]);
        } catch {
            return res.status(400).json({
                message: 'Could not read Schedule description'
            });
        }

        const validationResults = validateScheduleDescription(scheduleDescription);
    
        if (validationResults.length) return res.status(400).json({
            message: 'Bad Schedule Description',
            validationResults,
        });
    }

    const requestedPlant = await helper.fetch_by_id(req.params.plant_id);

    if (!requestedPlant) return res.status(404).json({
        message: `Plant #${req.params.plant_id} not found`,
    });

    if (requestedPlant.user_id !== req.user.id && !req.user.is_total) return res.status(403).json({
        message: `Forbidden: You are not the parent of Plant #${req.params.plant_id}.`,
    });

    const file = req.file;

    let uploadedFile;

    let active;

    if (req.body.active === 'true') {
        active = true;
    } else if (req.body.active === 'false') {
        active = false;
    }

    if (file) {
        uploadedFile = await uploadToS3(file.buffer, file.mimetype);
    }

    const update = await helper.update_single({
        name: req.body.name || requestedPlant.name,
        description: req.body.description || requestedPlant.description,
        active: active ?? requestedPlant?.active ?? true,
        file_name: uploadedFile || requestedPlant.file_name || null,
        schedule: JSON.stringify(scheduleDescription || requestedPlant.schedule),
    }, requestedPlant.plant_id);

    if (!update.success) return res.status(422).json({
        message: `Failed to update Plant #${req.params.plant_id}.`,
    });

    return res.status(200).json(update);
});

plantRouter.delete('/:plant_id', async (req, res) => {
    const requestedPlant = await helper.fetch_by_id(req.params.plant_id);

    if (!requestedPlant) return res.status(404).json({
        message: `Plant #${req.params.plant_id} not found`,
    });

    if (requestedPlant.user_id !== req.user.id && !req.user.is_total) return res.status(403).json({
        message: `Forbidden: You are not the parent of Plant #${req.params.plant_id}.`,
    });

    const update = await helper.hard_delete({
        plant_id: req.params.plant_id
    });

    if (!update.success) return res.status(422).json({
        message: `Failed to delete Plant #${req.params.plant_id}.`,
    });

    return res.status(200).json(update);
});

export default plantRouter;

function validateScheduleDescription(scheduleDescription) {
    //step 1, check that pattern is valid
    if (!['interval', 'weekly', 'monthly'].includes(scheduleDescription?.pattern)) return false;

    let {
        pattern
    } = scheduleDescription;

    let errors = [];

    if (pattern === 'interval') {
        if (typeof scheduleDescription?.interval?.quantity !== 'number') {
            errors.push('quantity not number');
        }
        if (scheduleDescription?.interval?.quantity > 500) {
            errors.push('quantity too high');
        }
        if (scheduleDescription?.interval?.quantity < 1) {
            errors.push('quantity too low');
        }

        if (Math.floor(scheduleDescription?.interval?.quantity) !== scheduleDescription?.interval?.quantity) {
            errors.push('quantity not integer');
        }

        if (!['day', 'week'].includes(scheduleDescription?.interval?.unit)) {
            errors.push(`unrecognized unit`);
        }
        return errors;
    }

    let entries = [];

    if (['weekly', 'monthly'].includes(pattern)) {
        if (!scheduleDescription?. [pattern] || typeof scheduleDescription?. [pattern] !== 'object') {
            errors.push(`scheduleDescription[pattern] falsy`);
        }
        if (typeof scheduleDescription?. [pattern] !== 'object') {
            errors.push(`scheduleDescription[pattern] not object`);
        }
        entries = Object.entries(scheduleDescription?. [pattern]);
        if (!entries.length) {
            errors.push(`no entries in scheduleDescription[pattern]`);
        }
    }

    if (pattern === 'weekly') {
        entries.forEach(([key, value]) => {
            if (!daysOfTheWeek.includes(key)) {
                errors.push(`unrecognized key ${key}`);
            }
            if (typeof value !== 'boolean' && value != null) {
                errors.push(`unrecognized value ${value}`);
            }
        });
        return errors;
    }

    if (pattern === 'monthly') {
        entries.forEach(([key, value]) => {
            if (!daysOfTheMonthMap[key]) {
                errors.push(`unrecognized key ${key}`);
            }
            if (typeof value !== 'boolean' && value != null) {
                errors.push(`unrecognized value ${value}`);
            }
        });
        return errors;
    }

    return errors;
};

// const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * 
 * @param {{
 *  pattern: 'interval' | 'weekly' | 'monthly',
 *  weekly?: {
 *      Monday?: boolean,
 *      Tuesday?: boolean,
 *      Wednesday?: boolean,
 *      Thursday?: boolean,
 *      Friday?: boolean,
 *      Saturday?: boolean,
 *      Sunday?: boolean
 *   },
 *  monthly?: {
 *      1?: boolean,
 *      2?: boolean,
 *      3?: boolean,
 *      4?: boolean,
 *      5?: boolean,
 *      6?: boolean,
 *      7?: boolean,
 *      8?: boolean,
 *      9?: boolean,
 *      11?: boolean,
 *      12?: boolean,
 *      13?: boolean,
 *      14?: boolean,
 *      15?: boolean,
 *      16?: boolean,
 *      17?: boolean,
 *      18?: boolean,
 *      19?: boolean,
 *      21?: boolean,
 *      22?: boolean,
 *      23?: boolean,
 *      24?: boolean,
 *      25?: boolean,
 *      26?: boolean,
 *      27?: boolean,
 *      28?: boolean,
 *      29?: boolean,
 *      30?: boolean,
 *      31?: boolean,
 *  },
 *  interval?: {
 *      quantity: number,
 *      unit: 'day' | 'week'
 *  }
 *  created_on: Date,
 * }} scheduleDescription 
 * @param {Date} date 
 * @returns 
 */
function shouldEventOccur(scheduleDescription, date) {
    const day = date.getDate();
    const dayOfWeek = date.getDay();

    if (scheduleDescription?.pattern === 'weekly') {
        return !!scheduleDescription?.weekly?. [daysOfTheWeek[dayOfWeek]];
    }

    if (scheduleDescription?.pattern === 'monthly') {
        return !!scheduleDescription?.monthly?. [day];
    }

    if (scheduleDescription?.pattern === 'interval') {
        if (typeof scheduleDescription?.created_on === 'string') {
            scheduleDescription.created_on = new Date(scheduleDescription?.created_on);
        }

        const differenceInDays = Math.floor((date - scheduleDescription.created_on) / (1000 * 60 * 60 * 24));

        return differenceInDays % (scheduleDescription?.interval?.quantity * convertUnitToDays(scheduleDescription?.interval?.unit)) === 0;
    }

    return false;
};


function convertUnitToDays(unit) {
    return {
        day: 1,
        week: 7,
    } [unit] || 0;
};

function validateAndConvertDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(dateString)) return null;

    const date = new Date(dateString);

    if (!date.getTime() && date.getTime() !== 0) return null;

    const [year, month, day] = dateString.split('-').map(Number);

    if (date.getFullYear() !== year || (date.getMonth() + 1) !== month || date.getDate() !== day) return null;

    return date;
}