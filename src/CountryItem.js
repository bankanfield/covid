import React from 'react';
import './CountryItem.css';
import { numberWithCommas } from './util';

const CountryItem = ({ flag, fullName, shortName, timezone, currency, confirmed }) => {
    let timezoneTooltip = ''
    timezone.forEach(time => {
        timezoneTooltip += `(${time})`
    });
    return (<div className="country-item">
        <div className='shadow'><img src={flag} width={'100%'} alt={flag} style={{ marginBottom: '20px' }} /></div>
        <div className='name'>{fullName} ({shortName})</div>
        <div className='timezone' title={timezoneTooltip}>
            {
                timezone.map((time, index) => (
                    <span key={index}>({time})</span>
                ))
            }
        </div>
        {
            currency.map((ccy, index) => (
                <div className='ccy' key={index}>{ccy.name} ({ccy.symbol})</div>
            ))
        }
        <div className='defect'>จำนวนผู้ติดเชื้อ {numberWithCommas(confirmed)} คน</div>
    </div>)
}

export default CountryItem;