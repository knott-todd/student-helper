import React, { useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { useEffect } from 'react';

const SentenceSimilarity = () => {
    
    // Initialize model
    const [model, setModel] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Variables
    const [similarity, setSimilarity] = useState();
    const [sentence1, setSentence1] = useState('');
    const [sentence2, setSentence2] = useState('');

    useEffect(() => {
    const loadModel = async () => {
        const sentenceEncoder = await use.load();
        setModel(sentenceEncoder);
        setIsLoading(false);
    };

    loadModel();
    }, []);

    // Similarity analysis
    const calculateSimilarity = async (sentence1, sentence2) => {
        const sentence1Encoding = await model.embed(sentence1);
        const sentence2Encoding = await model.embed(sentence2);
        
        return cosineSimilarity(sentence1Encoding.arraySync()[0], sentence2Encoding.arraySync()[0]);
    };

    // Vector dot product
    const dot = (a, b) => {
        let tempA = [...a];
        let tempB = [...b];
        
        let output = tempA.map((x, i) => x * tempB[i]).reduce((m, n) => m + n);
        return output;
    };

    // Cosine similarity
    const cosineSimilarity = (a, b) => {

        let magnitudeA = Math.sqrt(dot(a, a));
        let magnitudeB = Math.sqrt(dot(b, b));
        if (magnitudeA && magnitudeB)
          return dot(a, b) / (magnitudeA * magnitudeB);
        else return false
    }
  
    return (
      <div>
        {isLoading ? (
          <p>Loading model...</p>
        ) : (
            <>
                {similarity ? <p>{Math.round(similarity * 100, 0)}%</p> : ""}
                <form>
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>

                        {/* <label htmlFor="sentence1">Sentence 1</label> */}
                        <input id='sentence1' value={sentence1} onChange={e => setSentence1(e.target.value)} placeholder="Compare this..." />

                        {/* <label htmlFor="sentence2">Sentence 2</label> */}
                        <input id='sentence2' value={sentence2} onChange={e => setSentence2(e.target.value)} placeholder="to this" />

                    </div>

                    <button onClick={async e => {e.preventDefault(); setSimilarity(await calculateSimilarity(sentence1, sentence2))}}>Check Similarity</button>
                </form>
            </>
        )}
        </div>
    );
};

export default SentenceSimilarity;
  