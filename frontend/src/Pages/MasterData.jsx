import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from '../Component/Alert';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import HeaderTitle from '../Component/HeaderTitle';

DataTable.use(DT);

const MasterData = ({ ...props }) => {
    document.title = `Master Data`; // Set the new title
    const API_URL = props.api_url;
    const [notif,setNotif] = useState({
        show:false,
        type:"",
        msg:""
    });
    const [reload,setReload] = useState(false);

    return (
        <>
            {
                notif.show && 
                <Alert 
                    type={notif.type} 
                    message={notif.msg} 
                    setNotif={setNotif}
                />
            }
            <Main>
                <HeaderTitle title={'Master Data'} />
                <FormUpload API_URL={API_URL} setNotif={setNotif} setReload={setReload} reload={reload} />
                <TableMasterData API_URL={API_URL} setNotif={setNotif} reload={reload} />
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

const TableMasterData = ({...props}) => {
    const [data,setData] = useState([])
    const dataMaster = async () => {
        try {
            const result = await axios.get(`${props.API_URL}/getDataMaster`)
            if(result.status === 200){
                setData(result.data.res)
            } else {
                setData([])
            }
        } catch (error) {
            props.setNotif({
                show:true,
                type:"warning",
                msg:error.response.data.res
            });
        }
    }

    useEffect(() => {
        dataMaster();
    },[props.reload])

    return(
        <div className="col-lg-12 mt-4">
            <div className="card">
                <div className="card-body">
                    <DataTable data={data} className='table table-bordered table-hover' 
                    options={{
                        columnDefs: [
                            {className:"text-center align-middle font10", targets:"_all"}
                        ]
                    }}>
                        <thead className='thead-light'>
                            <tr className='text-center'>
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
                    </DataTable>
                </div>
            </div>
        </div>
    )
}

const FormUpload = ({...props}) => {
    const [file, setFile] = useState(null)
    const [loadingUpload,setloadingUpload] = useState(false)
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Store the selected file
    };
    
    const handleSubmit = async (e) => {
        setloadingUpload(true)
        e.preventDefault();
        if (!file) {
            props.setNotif({
                show:true,
                type:"warning",
                msg:"Please select a file"
            })
            setloadingUpload(false)
            return
        }
        
        // Prepare the file for upload
        const formData = new FormData();
        formData.append("upload-file", file);
        
        try {
            const response = await axios.post(`${props.API_URL}/uploadData`,formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Required for file uploads
                    },
                }
            );

            if (response.status === 200) {
                props.setNotif({
                    show:true,
                    type:"success",
                    msg:"File uploaded successfully!"
                })
                props.setReload(!props.reload)
            } else {
                props.setNotif({
                    show:true,
                    type:"danger",
                    msg:"File upload failed. Please try again."
                })
                setloadingUpload(false)
            }
        } catch (error) {
            console.error("Error uploading file:", error)
            props.setNotif({
                show:true,
                type:"danger",
                msg:"An error occurred while uploading the file."
            })
            setloadingUpload(false)
        } finally {
            setloadingUpload(false)
        }
    };

    return (
        <div className="col-lg-4">
            <div className='card'>
                <div className='card-header'>
                    Upload Master Data
                </div>
                <div className='card-body'>
                    <form onSubmit={handleSubmit}>
                        <div className='input-group'>
                            <input type='file' className='form-control' id='file' accept='.xlsx' onChange={handleFileChange} />
                            <button type='submit' className='btn btn-primary'>{ loadingUpload ? <><i className="fas fa-spin fa-spinner"></i>&nbsp;Uploading...</> : <><i className="fas fa-upload pe-2"></i>Upload</> }</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MasterData;
