/**
 *  Copyright (c) 2015, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint max-len:0 */

import React from "react";
import _ from "underscore";
import Moment from "moment";
import { format } from "d3-format";

// Pond
import { TimeSeries } from "pondjs";

// Imports from the charts library
import ChartContainer from "../../../components/ChartContainer";
import ChartRow from "../../../components/ChartRow";
import Charts from "../../../components/Charts";
import YAxis from "../../../components/YAxis";
import ScatterChart from "../../../components/ScatterChart";
import Resizable from "../../../components/Resizable";

// Weather data
import weatherJSON from "./weather.json";

//
// Read in the weather data and add some randomness and intensity for fun
//

const points = [];
_.each(weatherJSON, readings => {
    const time = new Moment(readings.Time).toDate().getTime();
    const reading = readings["WindSpeedGustMPH"];
    if (reading !== "-" && reading !== 0) {
        points.push([
            time,
            reading * 5 + Math.random() * 2.5 - 2.5,
            reading * 3 + Math.random() * 4 - 2
        ]);
    }
});

//
// Timeseries
//

const series = new TimeSeries({
    name: "Gust",
    columns: ["time", "station1", "station2"],
    points
});


//
// Render scatter chart
//

const wind = React.createClass({

    getInitialState() {
        return {
            hover: null,
            highlight: null,
            selection: null,
            timerange: series.range()
        };
    },

    handleSelectionChanged(point) {
        this.setState({
            selection: point
        });
    },

    handleMouseNear(point) {
        this.setState({
            highlight: point
        });
    },

    render() {
        const highlight = this.state.highlight;
        const formatter = format(".2f");
        let text = `Speed: - mph, time: -:--`;
        let infoValues = [];
        if (highlight) {
            const speedText = `${formatter(highlight.event.get(highlight.column))} mph`;
            text = `
                Speed: ${speedText},
                time: ${this.state.highlight.event.timestamp().toLocaleTimeString()}
            `;
            infoValues = [{label: "Speed", value: speedText}];
        }

        const heat = ["#a50026","#d73027","#f46d43","#fdae61",
                      "#fee08b","#ffffbf","#d9ef8b","#a6d96a",
                      "#66bd63","#1a9850","#006837"]

        const perEventStyle = (column, event) => {
            const color = heat[Math.floor((1 - event.get("station1")/40) * 11)];
            return {
                normal: {
                    fill: color,
                    opacity: 1.0
                },
                highlighted: {
                    fill: color,
                    stroke: "none",
                    opacity: 1.0
                },
                selected: {
                    fill: "none",
                    stroke: "#2CB1CF",
                    strokeWidth: 3,
                    opacity: 1.0
                },
                muted: {
                    stroke: "none",
                    opacity: 0.4,
                    fill: color
                }
            }
        };

        return (
            <div>

                <div className="row">
                    <div className="col-md-12">
                        {text}
                    </div>
                </div>

                <hr />

                <div className="row">
                    <div className="col-md-12">
                        <Resizable>
                            <ChartContainer
                                timeRange={this.state.timerange}
                                enablePanZoom={true}
                                onBackgroundClick={() => this.setState({selection: null})}
                                onTimeRangeChanged={(timerange) => this.setState({timerange})}>
                                <ChartRow height="150" debug={false}>
                                    <YAxis id="wind-gust" label="Wind gust (mph)" labelOffset={-5}
                                           min={0} max={series.max("station1")} width="70" type="linear" format=",.1f"/>
                                    <Charts>
                                        <ScatterChart
                                            axis="wind-gust"
                                            series={series}
                                            columns={["station1", "station2"]}
                                            style={perEventStyle}
                                            info={infoValues}
                                            infoHeight={28} infoWidth={110}
                                            format=".1f"
                                            selection={this.state.selection}
                                            onSelectionChange={this.handleSelectionChanged}
                                            onMouseNear={this.handleMouseNear}
                                            highlight={this.state.highlight}
                                            radius={(event, column) => column === "station1" ? 3 : 2}/>
                                    </Charts>
                                </ChartRow>
                            </ChartContainer>
                        </Resizable>
                    </div>
                </div>

            </div>
        );
    }
});

// Export example
import wind_docs from "raw!./wind_docs.md";
import wind_thumbnail from "./wind_thumbnail.png";
export default {wind, wind_docs, wind_thumbnail};
