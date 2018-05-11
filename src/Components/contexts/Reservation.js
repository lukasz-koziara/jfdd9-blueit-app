import React, {Component} from 'react'
import SUV from '../img/car-SUV.jpg'
import fullsize from '../img/car-fullsize.jpg'
import compact from '../img/car-compact.jpg'
import minivan from '../img/car-minivan.jpg'

const ReservationContext = React.createContext();

export const ReservationConsumer = ReservationContext.Consumer;

export class ReservationProvider extends Component {
  state = {
    cars: [],

    reservedCarIds: [],

    makeReservation: carId => {
      this.setState({
        reservedCarIds: this.state.reservedCarIds.concat(carId)
      })
    },

    cancelReservation: carId => {
      this.setState({
        reservedCarIds: this.state.reservedCarIds.filter(
          id =>
            id !== carId
        )
      })
    },

    options: {
      minivan: {
        label: 'MINIVAN ',
        imageUrl: minivan
      },
      suv: {
        label: 'SUV ',
        imageUrl: SUV
      },
      compact: {
        label: 'COMPACT ',
        imageUrl: compact
      },
      fullsize: {
        label: 'FULLSIZE ',
        imageUrl: fullsize
      }
    }
  };

  render() {
    return (
      <ReservationContext.Provider value={this.state}>
        {this.props.children}
      </ReservationContext.Provider>
    )
  }

  componentDidMount() {
    const reservedCarsAsTextInJSONFormat = localStorage.getItem('storedReservedCarIds');
    const reservedCarsFromLocalStorage = JSON.parse(reservedCarsAsTextInJSONFormat);
    this.setState({
      reservedCarIds: reservedCarsFromLocalStorage || []
    });

    fetch(process.env.PUBLIC_URL + '/cars.json', {
      method: 'GET'
    }).then(response => {
      return response.json();
    }).then(cars => {
      console.log('cars', cars);
      this.setState({
        cars: cars
      })
    }).catch(error => {
      console.log('Error', error)
    })
  }

  componentDidUpdate() {
    const reservedCarIds = this.state.reservedCarIds;
    localStorage.setItem('storedReservedCarIds', JSON.stringify(reservedCarIds));
  }

}

export function withReservation(Component) {
  function ReservationAwareComponent(props) {
    return (
      <ReservationConsumer>
        {state =>
          <Component {...props} {...state}/>}
      </ReservationConsumer>
    );
  }

  ReservationAwareComponent.displayName = `ReservationAware(${Component.displayName || Component.name || 'Component'})`

  return ReservationAwareComponent
}