import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { SocketContext } from '../context/socket'
import { Piano } from '../models/piano/Piano'
import { Online } from '../online/Online'
import { Camera } from '../scene/Camera'
import { PianoState, useStore } from '../store'
import { UserInterface } from '../ui/UserInterface'

export function Room() {
  const socket = useContext(SocketContext)
  const navigate = useNavigate()
  const room = useParams().roomId
  const username = sessionStorage.getItem('username')
  const timestamp = sessionStorage.getItem('timestamp') || Date.now().toString()

  const [orbitControlsEnabled, setPointerDown, setPointerUp] = useStore((state: PianoState) => [
    state.orbitControlsEnabled,
    state.setPointerDown,
    state.setPointerUp,
  ])

  useEffect(() => {
    const handleResponse = (response: { status: string }) => {
      if (response.status === 'error') navigate('/join')
    }

    // If the user joins directly to the room but does not have a username,
    // redirect to the join screen but store the room in sessionStorage
    // so that the room can be pre-filled when the user returns to the join screen.
    if (room) sessionStorage.setItem('room', room.substring(0, 4))

    // Make sure that the user has a name and is in a valid room
    if (!username || !room) {
      navigate('/join')
    } else {
      socket.emit('join_room', { timestamp, username, room }, handleResponse)
      sessionStorage.setItem('timestamp', timestamp)
    }

    // Inform the server that the user has left the room
    return () => {
      if (username) socket.emit('leave_room', { room }, handleResponse)
      toast.dismiss()
    }
  }, [])

  return (
    <div className="w-full h-screen">
      <UserInterface />
      <Canvas onPointerUp={setPointerUp} onPointerDown={setPointerDown}>
        <Camera />
        <OrbitControls
          enabled={orbitControlsEnabled}
          minAzimuthAngle={-Math.PI / 2}
          maxAzimuthAngle={Math.PI / 2}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          maxDistance={300}
          minDistance={40}
          target={[-116, 0.6, -10.9]}
          enablePan={true} // TODO: disable
        />
        <ambientLight intensity={1} />
        <directionalLight color="#fcaa44" position={[0, 120, 205]} intensity={2} />
        <Piano />
        <Online room={room} />
      </Canvas>
    </div>
  )
}
