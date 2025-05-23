"use client"

import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter'
import React from 'react'

export default function page() {

    async function test(){
       const {data} = await observiumApi("/devices")
   

       console.log(data)
    }

   

  return (
    <div>
      <button
        onClick={test}
      >
        Peticion
      </button>
    </div>
  )
}
