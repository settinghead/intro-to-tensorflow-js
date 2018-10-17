import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

mobilenetTest();

async function mobilenetTest() {
  const model = await mobilenet.load();
  console.log(model);
  const img = tf.ones([1, 224, 224, 3]);
  const predictions = await model.classify(img);
  console.log(predictions);
}
