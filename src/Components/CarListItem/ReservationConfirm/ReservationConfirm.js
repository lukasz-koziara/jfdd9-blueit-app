import React, {Component, Fragment} from 'react'
import {withReservation} from "../../contexts/Reservation";
import moment from "moment/moment";
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import 'moment/locale/en-gb'
import '../../RentDateForm/RentDateForm.css'
import '../../CarListItem/CarRentButton/CarRentButton.css'
import {withCars} from "../../contexts/Cars";
import CarItem from "../CarItem";
import withRouter from "react-router-dom/es/withRouter";
import Link from "react-router-dom/es/Link";
import CarMap from "../../CarMap/CarMap.js";
import './ReservationConfrim.css'
import {flattenArrayOfArrays} from "../../../_utils_/flattenArrayOfArrays";

class ReservationConfirm extends Component {

  state = {
    carId: null,
    startDate: null,
    endDate: null,
    place: null,
    noRentBtn: true
  }

  static getDerivedStateFromProps(nextProps, currentState) {
    // console.log('ReservationConfirm getDerivedStateFromProps, (nextProps):', nextProps)
    if (nextProps.currentReservation === null) {
      nextProps.history.push('/')
      return null
    } else return {
      ...nextProps.currentReservation,
      startDate: nextProps.startDate,
      endDate: nextProps.endDate
    }
  }

  handleSubmit = event => {
    event.preventDefault()
  }

  handleChangeStartDate = date => {
    this.setState({
      startDate: date,
      endDate: (this.state.endDate > moment(date).add(14, "days")) ?
        moment(date).add(14, "days") :
        date
    }, this.passToParent)
  };

  handleChangeEndDate = date => {
    this.setState({
      endDate: date
    }, this.passToParent)
  };

  isStartDateEmpty = () => {
    return this.state.startDate === null
  };

  passToParent = () => {
    this.props.rentDates(this.state.startDate, this.state.endDate)
  };

  excludedDates = (startDate, endDate) => {
    // debugger
    let datesArray = []

    const currentDateConst = moment(startDate)
    const endDateConst = moment(endDate)
    datesArray.push(currentDateConst.format('YYYY-MM-DD'))
    while (currentDateConst.add(1, 'days').diff(endDateConst) <= 0) {
      // console.log('currentDateConst:', currentDateConst, 'endDateConst', endDateConst)
      datesArray.push(currentDateConst.clone().format('YYYY-MM-DD'))
    }
    // console.log('datesArray', datesArray)
    return datesArray
  };

  render() {
    let datesToExclude = []
    this.props.reservations.filter(reservation =>
      reservation.carId === this.state.carId
    ).map(reservation =>
      datesToExclude.push(this.excludedDates(reservation.startDate, reservation.endDate))
    )

    // console.log('EXCLUDED FUNCTION', this.excludedDates('2018-06-07', '2018-06-09'))
    // let excludedDates2 = []
    // console.log('ReservationConfirm render (this.props)', this.props)
    // console.log('Router id:', this.props.match.params.carId)
    // console.log(this.state)
    // console.log('RESERVATIONS IN STATE', this.props.reservations)
    // console.log('MOMENT SUBSTRACTION', (moment('2018-06-05').diff(moment('2018-06-01'), 'days')+1))
    // console.log('FIND RESERVATION', this.props.reservations.filter(reservation =>
    //   reservation.carId === this.state.carId
    // ).map(reservation =>
    //   console.log(this.excludedDates(reservation.startDate, reservation.endDate))
    // ))
    // console.log('EXCLUDED DATES ARRAY', excludedDates2)

    if (this.state.carId === null) {
      return <div/>
    }

    const car = this.props.cars.find(car =>
      car.id === this.state.carId
    )

    // let excluded = this.props.reservations.find(reservation =>
    //   reservation.carId === this.state.carId
    // ).calculateExcludedDates(reservation.startDate, reservation.endDate)

    return (
      <Fragment>

        <h2>Rental summary</h2>

        <CarItem noRentBtn={this.state.noRentBtn}
                 car={car}/>
        <div className={'rentsum'}>
          <form onSubmit={this.handleSubmit} className={'rentsumform'}>

            <div className="datePicker__container">
              <DatePicker
                className="RentDateForm"
                locale="en-gb"
                dateFormat="YYYY/MM/DD"
                placeholderText="Start date"
                todayButton={"Today"}
                minDate={moment()}
                maxDate={moment().add(1, "month")}
                selected={this.state.startDate}
                selectsStart
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                onChange={this.handleChangeStartDate}
                excludeDates={flattenArrayOfArrays(datesToExclude)}
                // withPortal
                fixedHeight
              />

              <DatePicker
                className="RentDateForm"
                locale="en-gb"
                dateFormat="YYYY/MM/DD"
                placeholderText="End date"
                minDate={moment(this.state.startDate)}
                maxDate={
                  datesToExclude.length > 0 && flattenArrayOfArrays(datesToExclude
                  ).map(item => moment(item)).filter(
                    date =>
                      date.isAfter(this.state.startDate)
                  ).sort()[0] ||
                  moment(this.state.startDate).add(14, "days")
                }
                selected={this.state.startDate === null ?
                  undefined :
                  (this.state.startDate > this.state.endDate) ?
                    this.state.startDate :
                    (this.state.endDate > moment(this.state.startDate).add(14, "days")) ?
                      moment(this.state.startDate).add(14, "days") :
                      this.state.endDate}
                selectsEnd
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                onChange={this.handleChangeEndDate}
                disabled={this.isStartDateEmpty()}
                excludeDates={flattenArrayOfArrays(datesToExclude)}
                // withPortal
                fixedHeight
              >
                <div className="CalendarDateTo">
                  Maximum rent period is 14 days
                </div>
              </DatePicker>
            </div>


            <div className="ReservationConfirmButtonsContainer">
              <Link to="/">
                <button
                  className="RentBtnReserved"
                >
                  Cancel
                </button>
              </Link>

              <Link to="/my-rentals-screen">
                <button
                  className="RentBtn"
                  onClick={
                    () => {
                      this.props.makeReservation(this.state)
                    }
                  }
                >
                  Confirm
                </button>
              </Link>
            </div>
          </form>
          <div className={'rentmap'}
               style={{width: '50%', height: '90%', position: 'absolute', right: '5%', top: '5%'}}>
            <CarMap car={car}/>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default withRouter(withCars(withReservation(ReservationConfirm)))