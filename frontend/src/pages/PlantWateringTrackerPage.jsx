import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import NavMenu from "../components/NavMenu";
import { Modal, Button, Grid, Text, Card, Input, Checkbox, Tooltip, Row, Textarea } from "@nextui-org/react";
import CustomizedDropdown from '../fields/CustomizedDropdown';
import NumberField from '../fields/NumberField.jsx';
import CustomButton from "../fields/CustomButton";
import niceLister from "../utils/niceLister.js";
import nth from "../utils/nth.js";
import DeletionModal from "../components/DeletionModal";

const delay = 300;

const listOptions = [
    {
        key: 'watering',
        name: 'Watering List',
        description: 'due today'
    },
    {
        key: 'active_plants',
        name: 'Active Plants',
        description: ''
    },
    {
        key: 'all_plants',
        name: 'All Plants',
        description: 'including deactivated ones'
    }
];

const patternOptions = [
    {
        key: 'interval',
        name: 'Inverval',
        description: 'Every 3 days'
    },
    {
        key: 'weekly',
        name: 'Weekly',
        description: 'Every Monday & Thursday'
    },
    {
        key: 'monthly',
        name: 'Monthly',
        description: 'On the 1st, 11th and 22nd'
    }
];

const intervalUnitOptions = [
    {
        key: 'day',
        name: 'Days',
    },
    {
        key: 'week',
        name: 'Weeks',
    },
];

const daysOfTheWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const daysOfTheMonth = [];
for (let i = 1; i < 32; i++) {
    daysOfTheMonth.push(i.toString());
};

export default function PlantWateringTrackerPage() {

    const [activePlants, setActivePlants] = useState([]);
    const [allPlants, setAllPlants] = useState([]);

    const [wateringList, setWateringList] = useState([]);

    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [deletionModalOpen, setDeletionModalOpen] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    const [listType, setListType] = useState("watering");

    const [plantDetails, setPlantDetails] = useState({
        active: true,
    });
    const [uploadedImage, setUploadedImage] = useState(null);

    const listToDisplay = useMemo(() => {
        if (listType === 'watering') {
            return wateringList;
        }

        if (listType === 'active_plants') {
            return activePlants;
        }

        if (listType === 'all_plants') {
            return allPlants;
        }
        return [];
    }, [allPlants, wateringList, activePlants, listType]);

    useEffect(() => {
        if (listType === 'watering') {
            if (wateringList.length) return;
            axios.get('/plants/watering').then(res => {
                setWateringList(res.data.data);
            }).catch(() => { });
        } else if (listType === 'active_plants') {
            if (activePlants.length) return;
            axios.get('/plants/').then(res => {
                setActivePlants(res.data.data);
            }).catch(() => { });
        } else if (listType === 'all_plants') {
            if (allPlants.length) return;
            axios.get(`/plants?includeInactive=true`).then(res => {
                setAllPlants(res.data.data);
            }).catch(() => { });
        } else {
            setListType('all_plants');
        }
    }, [listType]);

    const handleCreateUpdate = () => {
        const toSend = new FormData();
        toSend.append('file', uploadedImage);
        toSend.append('name', plantDetails.name);
        toSend.append('active', plantDetails.active);
        toSend.append('description', plantDetails.description);
        toSend.append('pattern', plantDetails.pattern);
        toSend.append(plantDetails.pattern, JSON.stringify(plantDetails[plantDetails.pattern]));

        const onSuccess = () => {
            setActivePlants([]);
            setAllPlants([]);
            setWateringList([]);
            setListType('temp');
            setCreationModalOpen(false);
        }

        if (typeof creationModalOpen === 'boolean') {
            axios.post('/plants/', toSend).then((res) => {
                onSuccess();
            }).catch(e => {
                console.log(e?.response?.data?.message);
            });
        } else if (typeof creationModalOpen === 'number') {
            axios.put(`/plants/${creationModalOpen}`, toSend).then((res) => {
                onSuccess();
            }).catch(e => {
                console.log(e?.response?.data?.message);
            });
        }
    };

    return <>
        <NavMenu />
        <h1>Welcome to the Plant Watering Tracker!</h1>
        <CustomizedDropdown optionsList={listOptions} title="Showing" mountDirectly default_value="watering" outerUpdater={a => setListType(a)} />

        {!listToDisplay.length && <h2>No plants yet! Go ahead and add some! 🌱🪴🌿 </h2>}
        <Grid.Container gap={1} justify="center" >
            {listToDisplay.map((plant, index) =>
                <PlantCard
                    {...plant}
                    setCreationModalOpen={setCreationModalOpen}
                    setPlantDetails={setPlantDetails}
                    setDeletionModalOpen={setDeletionModalOpen}
                    key={`${index}-plant-card`} />
            )}
        </Grid.Container>

        <Button
            onPress={() => setPlantDetails({ active: true }) || setCreationModalOpen(true)}
            shadow
        > Let's Create a Plant! &nbsp; <i class="fa-solid fa-seedling" /></Button>

        <Modal scroll width="650px" open={!!creationModalOpen} onClose={() => setCreationModalOpen(false)} >
            <Modal.Header>
                <Text size={18} > Details of your new plant </Text>
            </Modal.Header>
            <Modal.Body>
                <div style={{ height: '12px' }} />
                <Input
                    bordered
                    required
                    value={plantDetails.name}
                    labelPlaceholder="Name"
                    clearable
                    onChange={(e) => setPlantDetails(p => ({ ...p, name: e.target.value }))}
                />
                <Textarea
                    bordered
                    rows={3}
                    value={plantDetails.description}
                    labelPlaceholder="Description"
                    css={{ marginTop: '18px' }}
                    clearable
                    onChange={(e) => setPlantDetails(p => ({ ...p, description: e.target.value }))} />

                <Input
                    label="If you'd like, you can upload a photo for your plant"
                    type="file"
                    multiple={false}
                    accept="image/png, image/gif, image/jpeg"
                    onChange={e => {
                        let file = e.target.files[0];
                        if (file) setUploadedImage(file);
                    }}
                />
                <Checkbox.Group
                    color="success"
                    value={plantDetails.active ? ['active'] : []}
                    onChange={val => setPlantDetails(p => ({
                        ...p,
                        active: !!val.length,
                    }))}
                >
                    <Grid.Container >
                        <Checkbox value="active">Active</Checkbox>
                    </Grid.Container>
                </Checkbox.Group>
                <CustomizedDropdown optionsList={patternOptions} title="Interval" mountDirectly default_value={plantDetails?.pattern || "interval"} outerUpdater={a => setPlantDetails(p => ({ ...p, pattern: a }))} />
                {plantDetails.pattern === 'interval' && <>
                    <Row gap="1rem" >
                        <CustomizedDropdown optionsList={intervalUnitOptions} title="Unit" mountDirectly default_value={plantDetails?.interval?.unit || "day"} outerUpdater={a => setPlantDetails(p => ({
                            ...p,
                            interval: {
                                ...(p.interval || {}),
                                unit: a
                            }
                        }))} />
                        <NumberField
                            default_value={plantDetails?.interval?.quantity || 1}
                            min={1}
                            max={50}
                            outer_updater={(v) => setPlantDetails(p => ({
                                ...p,
                                interval: {
                                    ...(p.interval || {}),
                                    quantity: v
                                }
                            }))}
                        />
                    </Row>
                </>}
                {plantDetails.pattern === 'monthly' && <>
                    <Checkbox.Group
                        label='Select days of the month'
                        color="success"
                        value={Object.keys(plantDetails.monthly || {})}
                        onChange={val => setPlantDetails(p => ({
                            ...p,
                            monthly: val.reduce((acc, cur) => ({ ...acc, [cur]: true }), {}),
                        }))}
                    >
                        <Grid.Container >
                            {daysOfTheMonth.map(option => <Grid xs={1.65}><Checkbox value={option}>{option}</Checkbox></Grid>)}
                        </Grid.Container>
                    </Checkbox.Group>
                </>}
                {plantDetails.pattern === 'weekly' && <>
                    <Checkbox.Group
                        label="Select days of the week"
                        color="success"
                        value={Object.keys(plantDetails.weekly || {})}
                        onChange={val => setPlantDetails(p => ({
                            ...p,
                            weekly: val.reduce((acc, cur) => ({ ...acc, [cur]: true }), {}),
                        }))}
                    >
                        <Grid.Container >
                            {daysOfTheWeek.map(option => <Grid xs={4}><Checkbox value={option}>{option}</Checkbox></Grid>)}
                        </Grid.Container>
                    </Checkbox.Group>
                </>}
            </Modal.Body>
            <Modal.Footer>
                <Button onPress={handleCreateUpdate} color="success" shadow size="lg" css={{ marginRight: 'auto', marginLeft: 'auto' }} > Create &nbsp; <i class="fa-solid fa-seedling" /></Button>
            </Modal.Footer>
        </Modal>

        <DeletionModal
            selfOpen={!!deletionModalOpen}
            setSelfOpen={setDeletionModalOpen}
            endPoint={`plants/${deletionModalOpen?.plant_id}`}
            outerUpdater={() => {
                setActivePlants(p => p.filter(plant => plant.plant_id !== deletionModalOpen?.plant_id));
                setAllPlants(p => p.filter(plant => plant.plant_id !== deletionModalOpen?.plant_id));
                setWateringList(p => p.filter(plant => plant.plant_id !== deletionModalOpen?.plant_id));
            }}
        />
    </>
}

function PlantCard({ plant_id, name, description, url, active, created_on, schedule, setCreationModalOpen, setPlantDetails, setDeletionModalOpen }) {
    return (
        <Grid xs={1.65}>
            <Card css={{ $$cardColor: active ? '$colors$primary' : 'grey' }}>
                <Card.Body>
                    <Row justify="space-around" >
                        <Text h3 color="white" css={{ mt: 0 }}>
                            #{plant_id}-{name}
                        </Text>
                        <Tooltip content="Modify" placement="top" shadow enterDelay={delay}>
                            <CustomButton buttonStyle="btn--transparent" onClick={() => {
                                setPlantDetails({
                                    name,
                                    description,
                                    active,
                                    ...schedule,
                                }); setCreationModalOpen(plant_id);
                            }} >
                                <i className="fa-regular fa-pen-to-square" />
                            </CustomButton>
                        </Tooltip>
                        <Tooltip content="Delete" placement="top" shadow enterDelay={delay}>
                            <CustomButton buttonStyle="btn--transparent" onClick={() => {
                                setDeletionModalOpen({
                                    name,
                                    description,
                                    created_on,
                                    plant_id,
                                });
                            }} >
                                <i className="fa-regular fa-trash-can" />
                            </CustomButton>
                        </Tooltip>
                    </Row>
                    <Text span color="white" css={{ mt: 0 }}>
                        {description}
                    </Text>
                    <Card.Divider />
                    {!!url && <img src={url} />}
                    <Card.Divider />
                    <Text span color="white" css={{ mt: 0 }}>
                        {ScheduleToSentence(schedule)}
                    </Text>
                    <Text span color="white" css={{ mt: 0 }}>
                        since: {new Date(created_on).toLocaleDateString('en-CA')}
                    </Text>
                </Card.Body>
            </Card>
        </Grid >
    );
}

function ScheduleToSentence(schedule) {
    if (schedule.pattern === 'weekly') {
        const days = Object.entries(schedule.weekly).filter(([_, active]) => active).map(([day, _]) => day);
        return `Every week on ${niceLister(days)}`;
    } else if (schedule.pattern === 'monthly') {
        const days = Object.entries(schedule.monthly).filter(([_, active]) => active).map(([day, _]) => parseInt(day)).map(nth);
        return `Every month on the ${niceLister(days)}`;
    } else if (schedule.pattern === 'interval') {
        return `Every ${schedule.interval.quantity} ${schedule.interval.unit}${schedule.interval.quantity === 1 ? '' : 's'}`;
    } else {
        return `Unknown schedule.`
    }
}