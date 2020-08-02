import { useContext } from 'react'
import { context } from '../canvas-refs'

export const useCanvas = () => useContext(context)
