import React from 'react'

const BarcodeData = ({data,handleSelectResource,isSelected,barcodeQuantities,handleQuantityChange}) => {
  return (
    <div className='row text-center data rounded bg-light'>
        <div className="col-2 d-flex gap-2 justify-content-center ">
            <input type="checkbox" checked={isSelected} name="" id="" onChange={()=>handleSelectResource(data.resource_id)}/>
        </div>
        <div className="col-3">
            {data.resource_title}
        </div>
        <div className="col-3">
            {data.type_name}
        </div>
        <div className="col-2">
            {data.isbn==null||data.isbn==''?'No ISBN':data.isbn}
        </div>
        <div className="col">
            <input 
                type="number" 
                in="1" 
                value={barcodeQuantities[data.resource_id] || 1} 
                onChange={(e) => handleQuantityChange(data.resource_id, e.target.value)} 
                className="text-center w-50"
            />
        </div>
     </div>
  )
}

export default BarcodeData
