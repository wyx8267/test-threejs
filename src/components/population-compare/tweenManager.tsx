// @ts-ignore
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'

class TweenManager {
  numTweensRunning: number
  constructor() {
    this.numTweensRunning = 0
  }
  _handleComplete() {
    --this.numTweensRunning
    console.assert(this.numTweensRunning >= 0)
  }
  createTween(targetObject: any) {
    const self = this
    ++this.numTweensRunning
    let userCompleteFn = (...args:any) => { }
    const tween = new TWEEN.Tween(targetObject).onComplete(function (...args: any) {
      self._handleComplete()
      // @ts-ignore
      userCompleteFn.call(this, ...args)
    })
    tween.onComplete = (fn: any) => {
      userCompleteFn = fn
      return tween
    }
    return tween
  }
  update() {
    TWEEN.update()
    return this.numTweensRunning > 0
  }
}

export default TweenManager