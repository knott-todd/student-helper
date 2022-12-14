const Progress = props => {
    return (
        <div>
            {props.label ? (
                <label for="avg">
                    {props.label} ({props.value ? ((props.value  * 100).toFixed(2) + "%") : "None"})
                </label>
            ): ""}

            <div className={`progress`} style={{overflow: "hidden", height: (props.height ? props.height : "9px"), width: (props.width ? props.width : "100px"), display:"inline-block"}}>
                <div className="progress-bg negative-progress-bg">
                    <div className="negative-progress" style={{maxWidth: "100%", width: props.value < 0 ? `${-props.value * 100}%` : 0}}/>
                </div>
                <div className="progress-bg positive-progress-bg">
                    <div className="positive-progress" style={{maxWidth: "100%", width: props.value > 0 ? `${props.value * 100}%` : 0}}/>
                </div>
            </div>
        </div>
    )
}

export default Progress;