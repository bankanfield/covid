import React, { useEffect, useState } from 'react';
import header from './asset/header.png'
import frame from './asset/frame.png'
import rectangle from './asset/rectangle.png'
import './App.css';
import CountryItem from './CountryItem';
import { numberWithCommas } from './util';
import Loader from './Loader';

const countriesApi = 'https://restcountries.eu/rest/v2/all'
const covidApi = 'https://api.covid19api.com/country/'
const minimunDefectRate = 10

const App = () => {
  const [populationCount, setPopulationCount] = useState(0)
  const [defectCount, setDefectCount] = useState(0)
  const [recoveredCount, setRecoveredCount] = useState(0)
  const [deathCount, setDeathCount] = useState(0)
  const [highDefectCountries, setHighDefectCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(countriesApi)
      .then((response) => (response.json()))
      .then((countries) => {
        let promiseArray = []
        let populationCountTmp = 0
        let defectCountTmp = 0
        let recoveredCountTmp = 0
        let deathCountTmp = 0
        countries.forEach(country => {
          promiseArray.push(fetch(covidApi + country.name).then((response) => { if (response.status === 200) { return response.json() } }))
          populationCountTmp += country.population
        })
        Promise.all(promiseArray).then((data) => {
          const filteredData = data.filter(covidInfo => (covidInfo && covidInfo.length)).map(covidInfo => covidInfo[covidInfo.length - 1]) //filter valid country response, latest update
          filteredData.forEach((covidInfo) => {
            defectCountTmp += covidInfo.Confirmed
            recoveredCountTmp += covidInfo.Recovered
            deathCountTmp += covidInfo.Deaths
          })

          const highDefectCountriesCovidInfo = filteredData.filter((covidInfo) => {
            const defectRate = covidInfo.Confirmed * 100 / defectCountTmp
            return defectRate > minimunDefectRate
          })

          const highDefectCountriesName = highDefectCountriesCovidInfo.map(country => country.Country)
          const decoratedCountries = []

          countries.forEach(country => {
            if (highDefectCountriesName.indexOf(country.name) > -1) {
              const currentCountryCovidInfo = highDefectCountriesCovidInfo[highDefectCountriesName.indexOf(country.name)]
              decoratedCountries.push({ ...country, confirmed: currentCountryCovidInfo.Confirmed })
            }
          })

          decoratedCountries.sort((a, b) => (b.confirmed - a.confirmed))

          setPopulationCount(populationCountTmp)
          setDefectCount(defectCountTmp)
          setRecoveredCount(recoveredCountTmp)
          setDeathCount(deathCountTmp)
          setHighDefectCountries(decoratedCountries)
          setLoading(false)

        }).catch((err) => {
          setLoading(false)
          setError(true)
          console.log(err.message)
        })
      })
  }, []);
  const errorWording = 'เกิดข้อผิดพลาดกรุณาลองใหม่'
  return (
    <div className="App">
      <div className='header-section'>
        <div>
          <img alt='header' className='header' width='300px' src={header}></img>
          <div className={loading ? '' : 'hidden'}><Loader /></div>
          <div className={error ? '' : 'hidden'}>{errorWording}</div>
          <ul className={loading || error ? 'hidden' : 'world-info'}>
            <li>จำนวนประชากรทั่วโลก <span className='kanit'>{numberWithCommas(populationCount)}</span> คน</li>
            <li>จำนวนผู้ติดเชื้อ <span className='kanit'>{numberWithCommas(defectCount)}</span> คน <span className='kanit'>({(defectCount * 100 / populationCount).toFixed(2)}%)</span></li>
            <li>จำนวนผู้ที่รักษาหาย <span className='kanit'>{numberWithCommas(recoveredCount)}</span> คน <span className='kanit'>({(recoveredCount * 100 / defectCount).toFixed(2)}%)</span></li>
            <li>จำนวนที่เสียชีวิตทั่วโลก <span className='kanit'>{numberWithCommas(deathCount)}</span> คน <span className='kanit'>({(deathCount * 100 / defectCount).toFixed(2)}%)</span></li>
          </ul>
        </div>
      </div>
      <div className="country-container">
        <img src={frame} alt="frame" width='100%' />
        <img src={rectangle} alt="rect" className='rect' width='350px' />
        <div className='rect'>ประเทศที่มีจำนวนผู้ติดเชื้อมากกว่า 10%</div>
        <div className='high-defect-section'>
          <div className={loading ? '' : 'hidden'}><Loader /></div>
          <div className={error ? '' : 'hidden'}>{errorWording}</div>
          <div className={loading || error ? 'hidden' : ''}>
            <div className='h7'><span className='hr-line'></span>จำนวนผู้ติดเชื้อทั่วโลก {numberWithCommas(defectCount)} คน<span className='hr-line'></span></div>
            {
              highDefectCountries.map((country, index) => (
                <CountryItem key={index} flag={country.flag} fullName={country.name} shortName={country.cioc} timezone={country.timezones} currency={country.currencies} confirmed={country.confirmed} />
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;