import type { PanoramaAPI } from '../../preload/index'

declare global {
  interface Window {
    panorama: PanoramaAPI
  }
}
