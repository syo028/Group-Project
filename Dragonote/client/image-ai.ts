import {
  loadImageClassifierModel,
  loadImageModel,
} from 'tensorflow-helpers/browser'

let loadModel = async () => {
  console.log('loading base image model...')
  let baseModel = await loadImageModel({
    url: '/saved_models/base_model',
    cacheUrl: 'indexeddb://base_model',
    checkForUpdates: false,
  })

  console.log('loading classifier model...')
  let classifier = await loadImageClassifierModel({
    baseModel,
    modelUrl: '/saved_models/classifier_model',
    cacheUrl: 'indexeddb://classifier_model',
    classNames: ['Food', 'Funny', 'Nail', 'Others', 'Travel'],
  })

  return classifier
}

let win: {
  modelPromise?: ReturnType<typeof loadModel>
} = window as any

win.modelPromise ||= loadModel()

async function classifyImage(image_url: string) {
  let classifier = await win.modelPromise!

  console.log('classifying image...')
  let result = await classifier.classifyImageUrl(image_url)

  console.log('classification result:', result)
}

// window.classifyImage = classifyImage
Object.assign(window, { classifyImage })
