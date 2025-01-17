import React, { useEffect, useState } from "react";
import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import Alert from '../Component/Alert';
import { Modal, Button } from 'react-bootstrap';
import moment from 'moment'
import axios from 'axios'
import '../Assets/FullCalendar.css'

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CustomToolbar = ({ date, onNavigate, label }) => {
    const monthSelect = sessionStorage.getItem("monthSelect")
    const yearSelect = sessionStorage.getItem("yearSelect")
    const [selectedMonth, setSelectedMonth] = useState(monthSelect ? monthSelect : date.getMonth());
    const [selectedYear, setSelectedYear] = useState(yearSelect ? yearSelect : date.getFullYear());
    const [optionYear,setoptionYear] = useState([])
    sessionStorage.setItem('monthSelect',selectedMonth)
    sessionStorage.setItem('yearSelect',selectedYear)

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const arrayYear = [];
    useEffect(() => {
        const setupYear = () => {
            const nowDate = new Date();
            const nowYear = nowDate.getFullYear();
            for (let i = 2024; i <= nowYear; i++) {
                arrayYear.push(i)
            }
    
            setoptionYear(arrayYear);
        }
        setupYear();
        // eslint-disable-next-line
    },[])

    // Handle change for year
    const handleChangePeriod = (e,period) => {
        if(period === "month"){
            const month = parseInt(e.target.value, 10);
            setSelectedMonth(month);
            const newDateMonth = new Date(selectedYear, month);
            onNavigate("date", newDateMonth);
            sessionStorage.setItem('monthSelect',month)
        }

        if(period === "year"){
            const year = parseInt(e.target.value, 10);
            setSelectedYear(year);
            const newDateYear = new Date(year, selectedMonth);
            onNavigate("date", newDateYear);
            sessionStorage.setItem('yearSelect',year)
        }
    };

    return (
        <div className="row mb-4" style={{position:"relative"}}>
            <div className="col-12 d-flex justify-content-center">
                <h3>{label}</h3>
            </div>
            <div className="col-2" style={{position:"absolute", top:"3px", right:"0px", zIndex: 2}}>
                <div className="input-group">
                    <select
                        value={selectedMonth}
                        onChange={(e) => handleChangePeriod(e,"month")}
                        style={{ marginRight: "10px" }}
                        className="form-control"
                    >
                        {months.map((month, index) => (
                        <option key={index} value={index}>
                            {month}
                        </option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => handleChangePeriod(e,"year")}
                        style={{ marginRight: "10px" }}
                        className="form-control"
                    >
                        {
                            optionYear.map((year,index) => (
                                <option key={index} value={year}>
                                    {year}
                                </option>
                            ))
                        }
                    </select>
                </div>
            </div>
        </div>
    );
};

const ButtonAction = ({setNotif,highlightedDates,api_url,hideModal}) => {
    const execSet = async ({tipe}) => {
        try {
            const formData = new FormData()
            formData.append("tanggal",highlightedDates)
            formData.append("tipe",tipe)
            const update = await axios.post(`${api_url}/saveCalendar`,formData)
            console.log(update)
            if(update.status === 200){
                hideModal()
                window.location.reload();
            }
        } catch (error) {
            console.log(error)
            setNotif({
                show:true,
                type:"danger",
                msg:error.response.data
            })
        }
    }

    return(
        <div className="row">
            <div className="col-12 d-flex justify-content-center">
                <h4 className="mb-3">Pilih status di bawah ini</h4>
            </div>
            <div className="col-12 d-flex justify-content-center">
                <Button variant="info" className="me-2" onClick={() => execSet({tipe:"1 Shift"})}>1 Shift</Button>
                <Button variant="info" className="me-2" onClick={() => execSet({tipe:"2 Shift"})}>2 Shift</Button>
                <Button variant="info" className="me-2" onClick={() => execSet({tipe:"OFF Production"})}>OFF Production</Button>
            </div>
        </div>
    )
}

const ModalStatus = ({children,openModal,hideModal}) => {
    return (
        <>
        <Modal 
            show={openModal} 
            onHide={() => hideModal()}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Update Status</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                { children }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => hideModal()}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
        </>
    )
}

const FullCalendar = ({api_url,setNotif}) => {
    const [openModal,setopenModal] = useState(false)
    const showModal = ()  => {
        setopenModal(true)
    }
    const hideModal = () => {
        setopenModal(false)
        setHighlightedDates([])
    }
    const [highlightedDates, setHighlightedDates] = useState([])
    const [datesProd1Shift, setdatesProd1Shift] = useState([])
    const [datesProd2Shift, setdatesProd2Shift] = useState([])
    const [datesOff, setdatesOff] = useState([])
    const [labelSetupNormal,setlabelSetupNormal] = useState(true)
    const monthSelect = sessionStorage.getItem("monthSelect")
    const yearSelect = sessionStorage.getItem("yearSelect")
    // Handle klik dan drag tanggal
    const handleSelectSlot = ({start, end}) => {
        showModal()
        // Fungsi untuk menghasilkan array tanggal antara start dan end
        const getDatesBetween = (startDate, endDate) => {
            const dateArray = [];
            let currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + 1)
            const lastDate = new Date(endDate)
            while (currentDate <= lastDate) {
                dateArray.push(
                    currentDate.toISOString().split("T")[0] // Format ke YYYY-MM-DD
                );
                currentDate.setDate(currentDate.getDate() + 1); // Tambah 1 hari
            }
            return dateArray;
        };
        // Panggil fungsi untuk mendapatkan array tanggal
        const dateRange = getDatesBetween(start, end);
        setHighlightedDates(dateRange)
    };
    useEffect(() => {
        const getWorkingDay = async (shift) => {
            try {
                const url = `${api_url}/getWorkingDay?shift=${shift}`
                const getData = await axios.get(url)
                if(getData.status === 200){
                    if(shift === 1){
                        setdatesProd1Shift(getData.data.res)
                    }else if(shift === 2){
                        setdatesProd2Shift(getData.data.res)
                    }else{
                        setdatesOff(getData.data.res)
                    }
                }
            } catch (error) {
                setNotif({
                    show:true,
                    type:"danger",
                    msg:error.response.data
                });
            }
        }
        getWorkingDay(1)
        getWorkingDay(2)
        getWorkingDay(0)
        // eslint-disable-next-line
    },[])
    // Fungsi untuk memberikan properti ke tanggal yang di-highlight
    const dayPropGetter = (date) => {
        const formattedDate = moment(date).format("YYYY-MM-DD");
        if (datesProd1Shift.includes(formattedDate)) {
            return { className: "bg-cell-1shift" }; // Tambahkan kelas CSS
        }else if (datesProd2Shift.includes(formattedDate)) {
            return { className: "bg-cell-2shift" }; // Tambahkan kelas CSS
        }else if (datesOff.includes(formattedDate)) {
            return { className: "bg-cell-off" }; // Tambahkan kelas CSS
        }
        return {}
    };
    const SetupNormal = async () => {
        try {
            const monthSelect = sessionStorage.getItem("monthSelect")
            const yearSelect = sessionStorage.getItem("yearSelect")
            setlabelSetupNormal(!labelSetupNormal)
            const formData = new FormData()
            formData.append("month",monthSelect)
            formData.append("year",yearSelect)
            const proses = await axios.post(`${api_url}/setupNormal`,formData)
            if(proses.status === 200){
                setNotif({
                    show:true,
                    type:"success",
                    msg:proses.data.res
                })
                window.location.reload()
            }
        } catch (error) {
            setNotif({
                show:true,
                type:"danger",
                msg:error.response.data
            })
        }
    }

    return (
        <>
        <div className="row" style={{position:"relative"}}>
            <div className="col-12 p-3">
                <Calendar
                    localizer={localizer}
                    selectable={true}
                    defaultView={Views.MONTH}
                    views={['month']}
                    startAccessor="start"
                    endAccessor="end"
                    defaultDate={new Date(yearSelect, monthSelect, 1)} // Default tampilkan Januari 2025
                    style={{ height: 770 }}
                    onSelectSlot={handleSelectSlot}
                    dayPropGetter={dayPropGetter}
                    components={{
                        toolbar: CustomToolbar, // Gunakan custom toolbar
                    }}
                />
            </div>
            <div className="col-12 p-0" style={{position:"absolute", top:"19px", left:"17px", zIndex: 1}}>
                <button className="btn btn-info me-2" onClick={SetupNormal}>{ labelSetupNormal ? "Setup Normal" : <><i className="fas fa-spinner fa-spin"></i> Sedang Setup...</> }</button>
            </div>
        </div>
        <ModalStatus openModal={openModal} hideModal={hideModal}>
            <ButtonAction setNotif={setNotif} highlightedDates={highlightedDates} api_url={api_url} hideModal={hideModal} />
        </ModalStatus>
        </>
    );
};

export default FullCalendar;
