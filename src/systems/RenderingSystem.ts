import * as THREE from 'three'
import { System, Not } from 'ecsy'
import PositionComponent from '../components/PositionComponent'
import ModelComponent from '../components/ModelComponent'
import { ThreeMeshStateComponent } from '../components/ThreeMeshStateComponent'
import ScaleComponent from '../components/ScaleComponent'

export default class RenderingSystem extends System {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer

  init() {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    function handleWindowResize() {
      const height = window.innerHeight
      const width = window.innerWidth
      const aspect = width / height

      renderer.setSize(width, height)

      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', handleWindowResize, false)

    camera.position.y = 2
    camera.position.z = 4
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    createLights().forEach((light) => scene.add(light))

    this.scene = scene
    this.renderer = renderer
    this.camera = camera
  }

  execute(delta, time) {
    this.queries.uninitialised.results.forEach((entity) => {
      const model = entity.getComponent(ModelComponent)
      const scale = entity.getComponent(ScaleComponent)

      const geometry = new THREE.BoxGeometry()
      const material = new THREE.MeshBasicMaterial({ color: model.color })

      geometry.center()

      const cube = new THREE.Mesh(geometry, material)
      cube.scale.set(scale.x, scale.y, scale.z)

      this.scene.add(cube)

      entity.addComponent(ThreeMeshStateComponent, { mesh: cube })
    })

    this.queries.initialised.results.forEach((entity) => {
      const { mesh } = entity.getComponent(ThreeMeshStateComponent)
      const position = entity.getComponent(PositionComponent)
      mesh.position.x = position.x
      mesh.position.y = position.y
      mesh.position.z = position.z

      mesh.quaternion.set(position.rotationX, position.rotationY, position.rotationZ, position.rotationW)
    })

    this.renderer.render(this.scene, this.camera)
  }
}

RenderingSystem.queries = {
  uninitialised: {
    components: [ModelComponent, ScaleComponent, Not(ThreeMeshStateComponent)],
  },

  initialised: {
    components: [PositionComponent, ThreeMeshStateComponent],
  },
}

function createLights() {
  const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9)

  const shadowLight = new THREE.DirectionalLight(0xffffff, 0.9)
  shadowLight.position.set(150, 350, 350)

  const ambientLight = new THREE.AmbientLight(0xdc8874, 0.5)

  return [hemisphereLight, shadowLight, ambientLight]
}
