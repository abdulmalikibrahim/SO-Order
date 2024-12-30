import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from '../Component/Alert';

const Index = ({ ...props }) => {
    document.title = `SO Ordering`; // Set the new title
    const API_URL = props.api_url;

    return (
        <>
            <div>Index</div>
        </>
    );
}

export default Index;
