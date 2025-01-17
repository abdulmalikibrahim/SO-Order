import React from 'react';
import FullCalendar from '../Component/FullCalendar';
// import 'rsuite/Calendar/styles/index.css';
import Alert from '../Component/Alert';
import HeaderTitle from '../Component/HeaderTitle';

const WorkingCalendar = ({api_url,notif,setNotif}) => {
    document.title = "Working Calendar"
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
                <HeaderTitle title={'Working Calendar'} />
                <Calendar>
                    <FullCalendar api_url={api_url} notif={notif} setNotif={setNotif}  />
                </Calendar>
            </Main>
        </>
    );
}

const Main = ({children}) => {
    return(
        <div className='row'>
            {children}
        </div>
    )
}

const Calendar = ({children}) => {
    return (
        <div className="col-12">
            <div className="card">
                <div className="card-body">
                    { children }
                </div>
            </div>
        </div>
    )
}

export default WorkingCalendar;