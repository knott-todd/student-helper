import { useState } from "react";
import { addQuestion, deletePaperQuestions } from "./services/SQLService";

const StructureParser = props => {
    const [quests, setQuests] = useState([{}]);
    const [input, setInput] = useState("");
    const [qCount, setQCount] = useState(0);

    function romanize (numArray) {
        let output = [];

        numArray.forEach(num => {
            if (isNaN(num))
                output.push("NaN");

            var digits = String(+num).split(""),
                key = ["","c","cc","ccc","cd","d","dc","dcc","dccc","cm",
                    "","x","xx","xxx","xl","l","lx","lxx","lxxx","xc",
                    "","i","ii","iii","iv","v","vi","vii","viii","ix"],
                roman = "",
                i = 3;
            while (i--)
                roman = (key[+digits.pop() + (i * 10)] || "") + roman;
            output.push(Array(+digits.join("") + 1).join("M") + roman);
        });

        return output;
        
    }

    const sendQuests = () => {
        deletePaperQuestions(props.paperID)
        .then(() => {
            
            quests.forEach((q, i) => {
                const fixed = Object.fromEntries(Object.entries(q).map(val => {
                    if (!val[1]) val[1] = null;
                    return val;
                }))
                
                fixed.paperID = props.paperID;
                addQuestion(fixed)
                .then(()=>{
                    if(i === quests.length - 1) {
                        setInput("")
                    }
                })
            })

        })
    }

    const ParseStructure = structString => {

        setQuests([]);

        if (structString.slice(-1) !== "\n") structString = structString.concat("\n");

        let output = [];

        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

        let layers = [{
            layer: 1,
            i: 0,
            set: [...Array(10).keys()].splice(1)
        },{
            layer: 2,
            i: 0,
            set: alphabet
        }, {
            layer: 3,
            i: 0,
            set: romanize([...Array(10).keys()].splice(1))
        }, {
            layer: 4,
            i: 0,
            set: alphabet
        }];

        let currDepth = 1;

        let count = 0;
        const numQs = structString.split("\n").length;
        console.log(numQs);

        for (let i = 0; i < structString.length - 1; i++) {
            const char = structString.charAt(i);

            let currLayer = {...layers.find(l => l.layer === currDepth)};
            let possible = [];

            // Filter expected chars
            // If i = 1, next can either be a) Subset opens (i = 1 of next layer) OR b) Set continues (i++ of current layer)
            if(currLayer.i === 1) {
                console.log("i = 1");

                // Subset opens unless L = 4
                if(currLayer.layer !== 4) {
                    
                    let next = {...layers.find(l => l.layer === currLayer.layer + 1)};
                    next.i = 1;
                    next.expected = next.set[next.i - 1];
    
                    possible.push(next);

                }

                // Set continues unless at max
                if(currLayer.i !== currLayer.set.length) {

                    let current = {...currLayer};
                    current.i++;
                    current.expected = `\n${current.set[current.i -1]}`;
    
                    possible.push(current);

                }
            }

            // If i > 1, next can either be a) Subset opens (i = 1 of next layer) OR b) Ancestor set continues (i++ of all layers where layer < currLayer)
            if(currLayer.i > 1) {
                console.log("i > 1");
                // Subset opens unless L = 4
                if(currLayer.layer !== 4) {

                    let next = {...layers.find(l => l.layer === currLayer.layer + 1)};
                    next.i = 1;
                    next.expected = next.set[next.i - 1];

                    console.log(layers)
    
                    possible.push(next);

                }

                // This or ancestor continues unless at max
                let ancestors = layers.filter(l => (l.layer <= currLayer.layer) && (l.i !== l.set.length));
                ancestors = ancestors.map(l => { 
                    let temp = {...l}; 
                    temp.i++;
                    temp.expected = `\n${temp.set[temp.i - 1]}`;
                    return temp;
                });

                possible = possible.concat(ancestors);

            }

            // If i = 0, next must open current set (i = 1 of this layer)
            if (currLayer.i === 0) {
                console.log("i = 0");
                // Set opens
                let current = {...currLayer};
                current.i = 1;
                current.expected = current.set[current.i - 1];

                possible.push(current);
            }

            possible = [...possible].map(l => { console.log("E: ", l.expected.toString()); console.log("Is: ", structString.slice(i, i + l.expected.toString().length)); return l;});

            // Match char to expected
            let layer = possible.find(l => l.expected.toString() === structString.slice(i, i + l.expected.toString().length));
            if(layer) {
                console.log("Match: ", layer);

                // If previous char was /n then reset subset indexes to 0
                if (layer.expected.toString().slice(0, 1) === "\n") {
                    // Clear sub layers
                    layers = [...layers].map(l => {
                        let temp = {...l};
                        console.log(temp.layer, layer.layer)
                        if(temp.layer > layer.layer) {
                            console.log(temp);
                            temp.i = 0;
                            temp.expected = temp.set[temp.i - 1];
                        }
                        console.log(temp);
                        return temp;
                    });
                }
                
                // Update local layer
                currDepth = layer.layer;
                layers[currDepth - 1] = {...layer};

                // If the next char is \n then all the question info is parsed
                if(structString.charAt(i + layer.expected.toString().length) === "\n") {
                    
                    count++;
    
                    // Handle question info
                    console.log("QUESTION", [...layers]);
                    let q = {
                        num: [...layers][0].set[[...layers][0].i - 1],
                        letter: [...layers][1].set[[...layers][1].i - 1],
                        roman: [...layers][2].set[[...layers][2].i - 1],
                        subLetter: [...layers][3].set[[...layers][3].i - 1]
                    }
                    output.push(q);

                }

                i += layer.expected.toString().length - 1;

            } else {
                console.error("No match");
            }
        }

        console.log(`THERE ARE ${count} QUESTIONS`);
        setQCount(count);

        setQuests(output)

    }

    return (
        <div className="structure-parser">
            <form>
                <textarea rows={10} cols={100} value={input} onChange={e => setInput(e.target.value)} />
                <button onClick={e => {e.preventDefault(); ParseStructure(input);}}>Parse</button>
                <button disabled={quests[0].num === undefined} onClick={e => {e.preventDefault(); sendQuests();}}>Submit</button>
            </form>
            <p>
                {qCount} questions found
            </p>
        </div>
    )
}

export default StructureParser