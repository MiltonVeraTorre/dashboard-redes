"use client"

import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter'
import React from 'react'

export default function page() {

    async function test(){
       const {data} = await observiumApi("/alerts/?status=failed")

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
