import React, { Component } from 'react'
import Candle from './Candle';

import "./candleContainer.css";
export default class CandleContainer extends Component {

    render() {
        return (
            <div className="candleContainer">
                <Candle/>
                <Candle/>
                <Candle/>
                <Candle/>
                <Candle/>
                <Candle/>
                <Candle/>
            </div>
        )
    }
}
