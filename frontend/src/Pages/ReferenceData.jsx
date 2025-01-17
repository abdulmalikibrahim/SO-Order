import React, { useCallback, useEffect, useState } from 'react';
import Alert from '../Component/Alert';
import axios from 'axios';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import HeaderTitle from '../Component/HeaderTitle';

DataTable.use(DT);

const ReferenceData = ({api_url}) => {
    const tab = [
        { idTab:"safety-stock-tab", target:"safety-stock", title:"Safety Stock", table:"safety_stock" },
        { idTab:"average-usage-tab", target:"average-usage", title:"Average Usage", table:"average_usage" },
        { idTab:"actual-gi-tab", target:"actual-gi", title:"Actual Good Issue", table:"actual_gi" },
        { idTab:"ratio-tab", target:"ratio", title:"Ratio", table:"ratio" },
        { idTab:"po-qty-tab", target:"po-qty", title:"PO Qty", table:"po_qty" },
        { idTab:"order-shop-tab", target:"order-shop", title:"Order By Shop", table:"order_by_shop" }
    ];

    const [notif,setNotif] = useState({
        show:false,
        type:"",
        msg:""
    });

    return(
        <>
            {
                notif.show && 
                <Alert 
                    type={notif.type} 
                    message={notif.msg} 
                    setNotif={setNotif}
                />
            }
            <HeaderTitle title={"Reference Data"} />
            <div className="card">
                <div className="card-header pb-0">
                    <Tabulation tab={tab} />
                </div>
                <div className="card-body">
                    <TabContent tab={tab} api_url={api_url} setNotif={setNotif} />
                </div>
            </div>
            
        </>
    )
}

const Tabulation = ({tab}) => {
    const [newTab, setnewTab] = useState([]);
    useEffect(() => {
        const dataTab = [];
        const setTabe = () => {
            tab.forEach((item, index) => {
                const idTab = item["idTab"];
                const target = "#"+item["target"];
                const ariaControls = item["target"];
                const title = item["title"];
                const active = index === 0 ? "active" : ""
                dataTab.push(
                    <li className="nav-item" role="presentation" key={"tabulation-"+idTab}>
                        <button className={"nav-link text-dark "+active} id={idTab} data-bs-toggle="tab" data-bs-target={target} type="button" role="tab" aria-controls={ariaControls} aria-selected="true">{title}</button>
                    </li>
                );
            })
            setnewTab(dataTab);
        }
        setTabe();
         // eslint-disable-next-line
    },[])
    return(
        <ul className="nav nav-tabs" id="tabData" role="tablist">
            {
                newTab.map((item) => {
                    return item;
                })
            }
        </ul>
    )
}

const TabContent = ({tab,api_url,setNotif}) => {
    return (
        <div className="tab-content" id="tabContent">
            {
                tab.map((item, index) => {
                    const active = index === 0 ? "show active" : ""
                    const tabulation = 
                    <div className={"tab-pane fade " + active} key={"tab-content-"+index} id={item["target"]} role="tabpanel" aria-labelledby={item["idTab"]}>
                        <div className="row">
                            <div className="col-12">
                                <CardContent api_url={api_url} table={item["table"]} setNotif={setNotif} title={item["title"]} />
                            </div>
                        </div>
                    </div>
                    return tabulation;
                })
            }
        </div>
    )
}

const CardContent = ({api_url,table,setNotif,title}) => {
    const [reloadData,setReloadData] = useState(false);
    const [buttonReload,setbuttonReload] = useState("fas fa-sync")
    const newDate = new Date();
    const [currentYear,setcurrentYear] = useState(newDate.getFullYear())
    const [currentMonth,setcurrentMonth] = useState((newDate.getMonth() + 1).toString().padStart(2,"0"))
    const [currentShop,setcurrentShop] = useState("")

    return(
        <div className="card">
            <div className="card-header text-center">
                <h4>{title}</h4>
                <button className="btn btn-sm btn-success" style={{position:"absolute", top:"10px", right:"10px"}} onClick={() => setReloadData(!reloadData)}>
                    <i className={buttonReload}></i>
                </button>
            </div>
            <FormUpload api_url={api_url} table={table} setNotif={setNotif} setReloadData={setReloadData} reloadData={reloadData} currentMonth={currentMonth} setcurrentMonth={setcurrentMonth} currentYear={currentYear} setcurrentYear={setcurrentYear} currentShop={currentShop} setcurrentShop={setcurrentShop} />
            <TableData api_url={api_url} table={table} setNotif={setNotif} currentMonth={currentMonth} currentYear={currentYear} currentShop={currentShop} setbuttonReload={setbuttonReload} reloadData={reloadData} />
        </div>
    )
}

const TableData = ({api_url,table,setNotif,currentMonth,currentYear,currentShop,setbuttonReload,reloadData}) => {
    const [data,setData] = useState([]);
    useEffect(() => {
        const getData = async () => {
            setbuttonReload("fas fa-sync fa-spin"); 
            try {
                const formData = new FormData()
                formData.append('table',table)
                
                const tableSortMonth = ["actual_gi","po_qty","order_by_shop"];
                if(tableSortMonth.includes(table)){
                    formData.append('month',currentMonth)
                    formData.append('year',currentYear)
                    formData.append('shop',currentShop)
                }
        
                const result = await axios.post(`${api_url+'/getDataReference'}`,formData)
                if(result.status === 200){
                    setData(result.data.res)
                } else {
                    setData([]);
                }
            } catch (error) {
                const msg = error.response.data.res ? error.response.data.res : error.response.data;
                setNotif({
                    show:true,
                    type:"danger",
                    msg:msg
                });
            } finally {
                setbuttonReload("fas fa-sync"); 
            }
        }

        getData();
    },[reloadData,setNotif,currentMonth,currentYear,currentShop])

    return (
        <div className="card-body">
            <DataTable data={data} className='table table-bordered table-hover' 
            options={{ 
                columnDefs: [
                    {className:"text-center align-middle font10", targets:"_all"}
                ]
            }}>
            <thead className='thead-light'>
                <tr className='text-center font10'>
                    <th>No</th>
                    {
                        table === "actual_gi" && <th>Tanggal</th>
                    }
                    {
                        table === "po_qty" && <><th>Month</th><th>PO Number</th></>
                    }
                    {
                        table === "order_by_shop" && <><th>Created</th><th>PDD</th><th>Shop</th></> 
                    }
                    <th>Part No</th>
                    <th>Part Name</th>
                    <th>Supplier</th>
                    <th>Tipe</th>
                    {
                        table === "ratio" ? <th>Ratio</th> : <th>Qty</th>
                    }
                </tr>
            </thead>
            </DataTable>
        </div>
    )
}

const FormUpload = ({api_url,table,setNotif,setReloadData,reloadData,currentMonth,setcurrentMonth,currentYear,setcurrentYear,currentShop,setcurrentShop}) => {
    const [file,setFile] = useState(null);
    const [loadingUpload,setLoadingUpload] = useState(false);
    const newDate = new Date();
    const yearNow = newDate.getFullYear();
    const uploadFile = async (e) => {
        e.preventDefault();
        try {
            setLoadingUpload(true);
            const formData = new FormData();
            formData.append('upload-file',file);
            formData.append('table',table);

            const result = await axios.post(`${api_url+'/uploadDataReference'}`,formData);
            if(result.status === 200){
                setNotif({
                    show:true,
                    type:"success",
                    msg:result.data.res
                });
                const inputFile = document.querySelectorAll(".file");
                inputFile.forEach((input) => {
                  input.value = "";  
                })
                setFile(null);
            } else {
                setNotif({
                    show:true,
                    type:"danger",
                    msg:result.data.res
                });
            }
            setReloadData(!reloadData);
        } catch (error) {
            const msg = error.response.data.res ? error.response.data.res : error.response.data;
            setNotif({
                show:true,
                type:"danger",
                msg:msg
            });
        } finally {
            setLoadingUpload(false);
        }
    }
    const loopMonth = () => {
        const month = {
            "JAN":"01",
            "FEB":"02",
            "MAR":"03",
            "APR":"04",
            "MEI":"05",
            "JUN":"06",
            "JUL":"07",
            "AUG":"08",
            "SEP":"09",
            "OKT":"10",
            "NOV":"11",
            "DEC":"12",
        }
        const result = []
        Object.entries(month).forEach((value) => {
            const valueMonth = value[0]
            const intMonth = value[1]
            result.push(<option key={"month-filter-gi-"+valueMonth} value={intMonth}>{valueMonth}</option>)
        });
        return result;
    }
    const loopYear = () => {
        const result = []
        for (let i = 2024; i <= yearNow; i++) {
            result.push(<option key={"year-filter-gi-"+i} value={i}>{i}</option>)
        }
        return result
    }
    const loopShop = () => {
        const shop = {
            "ALL":"",
            "CONS":"CONS",
            "CONS 1":"CONS 1",
            "ASSY 3":"ASSY 3",
            "ASSY 4":"ASSY 4",
            "PAINTING 3":"PAINTING 3",
            "PAINTING 4":"PAINTING 4"
        };
        const result = []
        Object.entries(shop).forEach((value,index) => {
            result.push(<option key={"shop-filter-gi-"+index} value={value[1]}>{value[0]}</option>)
        });
        return result;
    }
    const files = {
        "safety_stock":"Upload Reference Data.xlsx",
        "average_usage":"Upload Reference Data.xlsx",
        "po_qty":"Upload PO Qty.xlsx",
        "actual_gi":"Upload Good Issue.xlsx",
        "ratio":"Upload Ratio Data.xlsx",
        "order_by_shop":"Upload Order By Shop.xlsx"
    };
    const filterMonth = ["actual_gi","po_qty","order_by_shop"];
    const colFilter = table === "order_by_shop" ? "col-4" : "col-6";
    return(
        <div className="row">
            <div className='col-5'>
                <div className="card-body">
                    <form onSubmit={uploadFile}>
                        <label htmlFor="file" className="form-label mb-1">Upload File</label>
                        <div className="input-group">
                            <input type="file" className="form-control file" onChange={(e) => setFile(e.target.files[0])} />
                            <button type="submit" className="btn btn-primary">
                                {
                                    loadingUpload ? <><i className='fas fa-spinner fa-spin'></i> Uploading...</> : <><i className='fas fa-upload'></i> Upload</>
                                }
                            </button>
                        </div>
                        <div className='mt-1'>Download template <a href={ "/formUpload/" + files[table] } target='_blank' rel="noreferrer">disini</a></div> 
                        <div className="text-end">
                        </div>
                    </form>
                </div>
            </div>
            {
                filterMonth.includes(table) && 
                <div className="col-5">
                    <div className="card border-0">
                        <div className="card-body">
                            <div className="row">
                                {
                                    table === "order_by_shop" && 
                                    <div className={colFilter}>
                                        <label htmlFor="file" className="form-label mb-1">Shop Filter</label>
                                        <select className="form-control" defaultValue={currentShop} onChange={(e) => setcurrentShop(e.target.value)}>
                                            { loopShop() }
                                        </select>
                                    </div>
                                }
                                <div className={colFilter}>
                                    <label htmlFor="file" className="form-label mb-1">Month Filter</label>
                                    <select className="form-control" defaultValue={currentMonth} onChange={(e) => setcurrentMonth(e.target.value)}>
                                        { loopMonth() }
                                    </select>
                                </div>
                                <div className={colFilter}>
                                    <label htmlFor="file" className="form-label mb-1">Year Filter</label>
                                    <select className="form-control" defaultValue={currentYear} onChange={(e) => setcurrentYear(e.target.value)}>
                                        { loopYear() }
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default ReferenceData;