Simple demo that compares two ways to calculate mean/variance/standard deviation over incoming data within a fixed window size. In the first case, we re-calculate the statistics from scratch using all of the values currently within the window. In the second case, we use an adjusted version of Welford's method such that we only need to consider the value entering the window and the oldest value it is replacing.

To run: `node IterativeStatsWithWindow.js`

