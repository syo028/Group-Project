import 'tensorflow-helpers'
import {
  loadImageClassifierModel,
  loadImageModel,
  PreTrainedImageModels,
} from 'tensorflow-helpers'

console.log('loading base image model...')
let baseModel = await loadImageModel({
  spec: PreTrainedImageModels.mobilenet['mobilenet-v3-large-100'],
  dir: 'saved_models/base_model',
})

console.log('loading classifier model...')
let classifier = await loadImageClassifierModel({
  baseModel,
  modelDir: 'saved_models/classifier_model',
  datasetDir: 'dataset',
})

console.log('classifying image...')
let image =
  'dataset/Funny/0b86f3a840ace68598c80882d78242f526ae07426741894b8207d41a1f8dd820.jpeg'
image =
  'dataset/Food/0b7ecaad9d7eedf7529f5476ed56246845227c44e4094bf03ce841e2214a71d5.jpeg'
image =
  'C:\\Users\\hayma\\Downloads\\e222703b8f55a7e25ecf21a575270e516c1b49b68533018dbbc41f24e863d377.jpeg'
let result = await classifier.classifyImageFile(image)
console.log('classification result:', result)
