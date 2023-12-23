import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import NavMenu from "../components/NavMenu";
import { Modal, Button, Grid, Text, Card } from "@nextui-org/react";
import CustomizedDropdown from '../fields/CustomizedDropdown';

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

export default function PlantWateringTrackerPage() {

    const [activePlants, setActivePlants] = useState([]);
    const [allPlants, setAllPlants] = useState([]);

    const [wateringList, setWateringList] = useState([]);

    const [creationModalOpen, setCreationModalOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [listType, setListType] = useState("watering");

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
        }
    }, [listType]);

    return <>
        <NavMenu />
        <h2>Welcome to the Plant Watering Tracker!</h2>
        <CustomizedDropdown optionsList={listOptions} title="Showing" mountDirectly default_value="watering" outerUpdater={a => setListType(a)} />

        <Grid.Container gap={1} justify="center" >
            {listToDisplay.map((plant, index) =>
                <PlantCard
                    {...plant}
                    key={`${index}-plant-card`} />
            )}
        </Grid.Container>

        <Button
            onClick={() => setCreationModalOpen(true)}
            shadow
        > Let's Create a To-Do! </Button>

        <Modal open={creationModalOpen} onClose={() => setCreationModalOpen(false)} >

        </Modal>
    </>
}

function PlantCard({ name, description, url, active, schedule }) {
    return (
        <Card css={{ $$cardColor: active ? '$colors$primary' : 'grey' }}>
            <Card.Body>
                <Text h3 color="white" css={{ mt: 0 }}>
                    {name}
                </Text>
                <Text span color="white" css={{ mt: 0 }}>
                    {description}
                </Text>
                <Card.Divider />
                {!!url && <img src={url} />}
            </Card.Body>
        </Card>
    );
}