import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from '../Component/Alert';

const MasterData = ({ ...props }) => {
    document.title = `Master Data`; // Set the new title
    const API_URL = props.api_url;

    return (
        <>
            <Main>
                <FormUpload />
                <TableMasterData />
            </Main>
        </>
    );
}

const Main = ({children}) => {
    return (
        <div className='row'>
            {children}
        </div>
    );
}

const TableMasterData = () => {
    
    return(
        <div className="col-lg-12 mt-4">
            <table className='table'>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Part No</th>
                        <th>Part Name</th>
                        <th>QTY Kanban</th>
                        <th>Satuan SAP</th>
                        <th>Vendor Code</th>
                        <th>Supplier</th>
                        <th>Category</th>
                        <th>Tipe</th>
                        <th>Jam Delivery</th>
                        <th>Cycle</th>
                        <th>Cycle Issue</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>123</td>
                        <td>Product 1</td>
                        <td>1000</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

const FormUpload = () => {
    return (
        <div className="col-lg-4">
            <div className='card'>
                <div className='card-header'>
                    Upload Master Data
                </div>
                <div className='card-body'>
                    <form>
                        <div className='form-group'>
                            <input type='file' className='form-control' id='file' />
                        </div>
                        <button type='submit' className='btn btn-primary mt-2'>Upload</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MasterData;
