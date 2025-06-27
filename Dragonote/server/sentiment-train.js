const tf = require('@tensorflow/tfjs-node')

// 假設我們有簡單的訓練資料（0=負面, 1=正面）
const texts = [
  '我很開心', // 正面
  '這真棒',   // 正面
  '好喜歡',   // 正面
  '我很難過', // 負面
  '太糟了',   // 負面
  '討厭死了'  // 負面
]
const labels = [1, 1, 1, 0, 0, 0]

// 文字轉數字（最簡單做法：每個字一個 index）
const allChars = Array.from(new Set(texts.join('')))
const char2idx = Object.fromEntries(allChars.map((c, i) => [c, i + 1]))
const maxLen = 4

function textToTensor(text) {
  const arr = Array(maxLen).fill(0)
  Array.from(text).slice(0, maxLen).forEach((c, i) => {
    arr[i] = char2idx[c] || 0
  })
  return arr
}

const xs = tf.tensor2d(texts.map(textToTensor))
const ys = tf.tensor2d(labels.map(l => [l]))

// 建立簡單模型
const model = tf.sequential()
model.add(tf.layers.embedding({ inputDim: allChars.length + 1, outputDim: 4, inputLength: maxLen }))
model.add(tf.layers.flatten())
model.add(tf.layers.dense({ units: 8, activation: 'relu' }))
model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }))
model.compile({ loss: 'binaryCrossentropy', optimizer: 'adam', metrics: ['accuracy'] })

// 訓練
async function train() {
  await model.fit(xs, ys, {
    epochs: 50,
    verbose: 1
  })

  // 預測
  const testText = '好開心'
  const testTensor = tf.tensor2d([textToTensor(testText)])
  const pred = model.predict(testTensor)
  pred.print() // 越接近1越正面，越接近0越負面
}

train() 