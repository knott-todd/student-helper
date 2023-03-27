const SingleProgress = props => {
    return (
        <div>
            {/* {props.label ? (
                <label for="avg">
                    {props.label} ({props.value || props.value === 0 ? ((props.value  * 100).toFixed(0) + "%") : "None"})
                </label>
            ): ""} */}

            {/* <br /> */}
            <div className={`progress`} style={{...(props.overstyle ? props.overstyle : {}), overflow: "hidden", height: (props.height ? props.height : "9px"), width: (props.width ? props.width : "100px"), display:"inline-block", position: (props.position ? props.position : "static")}}>
                {/* <div className="progress-bg negative-progress-bg">
                    <div className="negative-progress" style={{maxWidth: "100%", width: props.value < 0 ? `${-props.value * 100}%` : 0}}/>
                </div> */}
                {/* <div className="progress-bg positive-progress-bg"> */}
                    <div className="single-progress" style={{backgroundColor: props.value >= 1 ? "gold" : "", maxWidth: "100%", width: props.value > 0 ? `${props.value * 100}%` : 0}}/>
                {/* </div> */}
            </div>
        </div>
    )
}

export default SingleProgress;