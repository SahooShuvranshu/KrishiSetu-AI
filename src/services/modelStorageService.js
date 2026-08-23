import offlineDiseases from '../data/offline_diseases.json';

let localModel = null;
let classNames = null;
let tf = null;

export async function loadLocalModel() {
  try {
    if (!tf) {
      tf = await import('@tensorflow/tfjs');
    }
    
    if (!localModel) {
      // It expects the model.json to be in the public/model/ folder
      localModel = await tf.loadLayersModel('/model/model.json');
      
      // Load classes
      const response = await fetch('/model/classes.json');
      classNames = await response.json();
      console.log("Local TFJS Model loaded successfully!");
    }
    return true;
  } catch (err) {
    console.warn("No local model found or TFJS failed. Falling back to JSON.", err);
    return false;
  }
}

export async function runInBrowserVisionInference(imageElement) {
  try {
    const isLoaded = await loadLocalModel();
    if (!isLoaded) {
      throw new Error("MODEL_NOT_INSTALLED");
    }

    // Prepare image for TFJS MobileNetV2 (224x224)
    const tensor = tf.browser.fromPixels(imageElement)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims(0)
      .div(255.0); // Normalize to 0-1

    const predictions = await localModel.predict(tensor).data();
    
    // Find highest probability
    let maxProb = 0;
    let maxIndex = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] > maxProb) {
        maxProb = predictions[i];
        maxIndex = i;
      }
    }

    const predictedClass = classNames[maxIndex];
    
    // Use the JSON strictly as a dictionary to lookup treatments for the AI's predicted class
    const protocol = offlineDiseases.find(d => d.disease_name.includes(predictedClass) || predictedClass.includes(d.crop_name)) 
      || { organic_remedy: "Maintain soil health.", chemical_remedy: "Consult local agriculture officer." };

    return {
      disease: `${predictedClass} (${(maxProb * 100).toFixed(1)}%)`,
      treatment: `Organic: ${protocol.organic_remedy}\n\nChemical: ${protocol.chemical_remedy}`
    };

  } catch (error) {
    console.error("TFJS Inference Error", error);
    throw error;
  }
}
