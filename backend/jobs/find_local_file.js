import fs from 'fs';

/**
 attempts to find the requested file in your device
 */
export default function find_local_file(__dirname, file_or_folder_name, additional_intermediary_folders = []) {

    if (!file_or_folder_name.startsWith('/')) file_or_folder_name = '/' + file_or_folder_name;
    if (additional_intermediary_folders.length) additional_intermediary_folders = additional_intermediary_folders.map(dir => (dir.startsWith('/') ? dir : '/' + dir));

    var result;

    loop1: for (let i = -1; i > -7; i--) { //TODO:add mechanism to identify and dig into folders using folder_traverser

        let path = `${__dirname.split(/[\\/]/).slice(0,i).join('/')}`;

        if (fs.existsSync(path + file_or_folder_name)) {
            result = path + file_or_folder_name;
            break loop1;
        }

        for (const folder of additional_intermediary_folders) {
            if (fs.existsSync(path + folder + file_or_folder_name)) {
                result = path + folder + file_or_folder_name;
                break loop1;
            }
        }

    }


    if (!result) {
        throw Error(`Cannot find the "${file_or_folder_name}" location.`);
    };
    // console.log(folder_traverser(result));
    console.log(`"${file_or_folder_name}" location: ` + result);
    return result;
}