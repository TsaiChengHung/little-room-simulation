import React, { useMemo, useEffect, useCallback } from 'react';
import useSelectionStore from '../Store/Store';
import * as THREE from 'three';
import { MeshPhysicalMaterial, Clock, MeshStandardMaterial } from 'three';
import RoomPointsTemplate from '../AssetManage/RoomSelector/RoomAttributes';
import Room from '../AssetManage/RoomSelector/RoomGenerator';

const GeneratedRoom = () => {

    const {roomType} = useSelectionStore()
    const floorPoints = RoomPointsTemplate(roomType)

    return (
        <Room floorPoints={floorPoints} />
    )

}

export default GeneratedRoom;