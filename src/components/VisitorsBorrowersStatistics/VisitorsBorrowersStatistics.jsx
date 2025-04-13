import React from 'react'
import { Bar } from 'react-chartjs-2'
import Chart from 'chart.js/auto';

const VisitorsBorrowersStatistics = ({chartData}) => {
    console.log(chartData)
  return <Bar data={chartData} />
  
}

export default VisitorsBorrowersStatistics
