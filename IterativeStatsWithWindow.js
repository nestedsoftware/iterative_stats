class CircularBuffer {
    constructor(bufferLength) {
        this.bufferLength = bufferLength
        this.index = 0
        this.buffer = []
    }

    append(value) {
        let poppedValue = null
        if (this.length === this.bufferLength) {
            poppedValue = this.buffer[this.index]
        }
        this.buffer[this.index] = value
        this.index = (this.index+1) % this.bufferLength

        return poppedValue
    }

    get length() {
        return this.buffer.length
    }

    items() {
        return this.buffer
    }
}

class RunningStatsCalculator {
    constructor(bufferLength) {
        this.circularBuffer = new CircularBuffer(bufferLength)
        this._mean = 0
        this._dSquared = 0
    }

    get count() {
        return this.circularBuffer.length
    }

    update(newValue) {
        const poppedValue = this.circularBuffer.append(newValue)

        if (this.count == 1 && poppedValue == null) {
            // initialize when the first value is added
            this._mean = newValue
            this._dSquared = 0
        } else if (poppedValue == null) {
            // if the buffer is not full yet, use standard Welford method
            const meanIncrement = (newValue - this._mean) / this.count
            const newMean = this._mean + meanIncrement

            const dSquaredIncrement = ((newValue - newMean)
                * (newValue - this._mean))
            const newDSquared = this._dSquared + dSquaredIncrement

            this._mean = newMean
            this._dSquared = newDSquared
        } else {
            // once the buffer is full, adjust Welford Method for window size
            const meanIncrement = (newValue - poppedValue) / this.count
            const newMean = this._mean + meanIncrement

            const dSquaredIncrement = ((newValue - poppedValue)
                * (newValue - newMean + poppedValue - this._mean))
            const newDSquared = this._dSquared + dSquaredIncrement

            this._mean = newMean
            this._dSquared = newDSquared
        }
    }

    get mean() {
        this.validate()
        return this._mean
    }

    get dSquared() {
        this.validate()
        return this._dSquared
    }

    get populationVariance() {
        return this.dSquared / this.count
    }

    get populationStdev() {
        return Math.sqrt(this.populationVariance)
    }

    get sampleVariance() {
        return this.count > 1 ? this.dSquared / (this.count - 1) : 0
    }

    get sampleStdev() {
        return Math.sqrt(this.sampleVariance)
    }

    summary() {
        return {
            mean: this.mean,
            dSquared: this.dSquared,
            populationVariance: this.populationVariance,
            sampleVariance: this.sampleVariance,
            populationStdev: this.populationStdev,
            sampleStdev: this.sampleStdev
        }
    }

    validate() {
        if (this.count == 0) {
            throw new StatsError('Mean is undefined')
        }
    }
}

class StatsError extends Error {
    constructor(...params) {
        super(...params)

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, StatsError)
        }
    }
}

const sum = values => values.reduce((a,b)=>a+b, 0)

const validate = values =>  {
    if (!values || values.length == 0) {
        throw new StatsError('Mean is undefined')
    }
}

const simpleMean = values => {
    validate(values)

    const mean = sum(values)/values.length

    return mean
}

const simpleStats = values => {
    const mean = simpleMean(values)

    const dSquared = sum(values.map(value=>(value-mean)**2))

    const populationVariance = dSquared / values.length
    const sampleVariance = values.length > 1
        ? dSquared / (values.length - 1) : 0

    const populationStdev = Math.sqrt(populationVariance)
    const sampleStdev = Math.sqrt(sampleVariance)

    return {
        mean,
        dSquared,
        populationVariance,
        sampleVariance,
        populationStdev,
        sampleStdev
    }
}


const sourceValues = [1000000,22.2,33.3,44.4,55.5,66.6,77.7,88.8,0.0,100.1]

const circularBuffer = new CircularBuffer(5)
const circularStats = new RunningStatsCalculator(5)
for (const value of sourceValues) {
    circularBuffer.append(value)
    console.log("simple stats", simpleStats(circularBuffer.items()))

    circularStats.update(value)
    console.log("iterative stats", circularStats.summary())
}

