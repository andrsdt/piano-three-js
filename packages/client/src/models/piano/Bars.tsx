import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Group, Mesh } from 'three'
import { PianoState, useStore } from '../../store'

const SECONDS_VISIBLE = 10 // How long the bars are is visible since the moment the key is released
const BAR_SPEED = 0.1 // How fast the bars move

interface IBar {
  startMoment: number
  endMoment?: number
  keyModel: Mesh
  isActive: boolean
}

const isBlackKey = (note: string) => note.includes('#')

function Bar(props: { keyModel: Mesh; isActive: boolean }) {
  const { keyModel, isActive } = props
  const mesh = useRef()

  // This reference will give us direct access to the mesh
  // Set up state for the hovered and active state
  // Subscribe this component to the render-loop, rotate the mesh every frame

  // TODO: may the useFrame affect the entire group of keys. It could be more
  // performant since only the position of the group is updated
  useFrame(() => {
    if (!mesh.current) return
    const current = mesh.current as Mesh
    current.position.y += isActive ? BAR_SPEED / 5 : BAR_SPEED / 2
    if (isActive) current.scale.y += BAR_SPEED * 4
  })

  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      // @ts-expect-error allow mutable refs
      ref={mesh}
      position={[keyModel.position.x, 2, keyModel.position.z - (isBlackKey(keyModel.name) ? 0 : 0.35)]}
      rotation={[0, Math.PI / 2, 0]}>
      <boxGeometry args={[0.5, 0.1, keyModel.scale.z * 2]} />
      <meshStandardMaterial color={'green'} />
    </mesh>
  )
}

export function Bars(props: { piano: Group }) {
  const { piano } = props
  const pianoKeys = piano.children.find((child) => child.name === 'keys') as Group
  const [bars, setBars] = useState<IBar[]>([])

  const pressedKeys = useStore((state: PianoState) => state.pressedKeys)

  useEffect(() => {
    // Copy the current state of bars
    const newBars = [...bars]

    // ADD NEW BARS TO THE LIST
    //For each key in pressedKeys, check if there is not a bar for that key
    // with property isActive set to true. If there is not, create a new bar and add it to the list.
    pressedKeys.forEach((k) => {
      const keyModel = pianoKeys.children.find((child) => child.name === k.key.note) as Mesh
      const newBar = { startMoment: Date.now(), keyModel, isActive: true }
      newBars.push(newBar)
    })

    newBars.forEach((bar) => {
      // SET ISACTIVE TO FALSE FOR BARS THAT ARE NOT BEING PRESSED ANYMORE
      // For each active bar in bars, check if the key is in pressedKeys. If not, set isActive to false.
      if (!pressedKeys.find((k) => bar.isActive && k.key.note === bar.keyModel.name)) {
        bar.isActive = false
        if (!bar.endMoment) bar.endMoment = Date.now()
      }

      // CLEAN THOSE BARS THAT ARE NOT VISIBLE ANYMORE
      // Necessary so that we don't render bars that are not visible anymore,
      // since they end up slowing down the rendering
      if (bar.endMoment && bar.endMoment + SECONDS_VISIBLE < Date.now()) newBars.splice(newBars.indexOf(bar), 1)
    })

    setBars(newBars)

    // Eliminate all the bars on component unmount
    return () => {
      setBars([])
    }
  }, [pressedKeys])

  return (
    <group>
      {bars.map((b) => (
        // TODO: change the unique key to be somethig more meaningful
        <Bar key={`${b.keyModel.name} ${b.startMoment}`} keyModel={b.keyModel} isActive={b.isActive} />
      ))}
    </group>
  )
}
