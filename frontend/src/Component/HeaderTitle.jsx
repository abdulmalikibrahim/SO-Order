import React from 'react';

const HeaderTitle = ({title}) => {
    return (
        <div className="col-lg-8 d-flex align-items-center mb-3">
            <h1 className='text-light' style={{fontSize:"50pt"}}>{title}</h1>
        </div>
    )
}

export default HeaderTitle;