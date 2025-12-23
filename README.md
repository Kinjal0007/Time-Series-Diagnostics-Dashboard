# Time-Series Diagnostics Dashboard

This application is a specialized analytical tool designed to simulate, visualize, and diagnose stochastic time series processes, including AutoRegressive (AR), Moving Average (MA), and Random Walk models. It was developed to solve quantitative finance problems by verifying statistical properties through Monte Carlo simulations.

## Key Features

- Process Simulation: Generates synthetic data for various time series models (AR, MA, Random Walk) to study their behavior under different parameters.
- Statistical Analysis: Automatically calculates and displays critical metrics such as Daily Mean, Daily Volatility, and Annualized Statistics (Mean/Std Dev) to verify theoretical expectations.
- Visual Diagnostics: Provides interactive "Returns Overview" plots to visually identify clustering (AR), mean reversion (MA), or white noise behavior (Random Walk).
- Data Processing: Includes a CSV input interface for uploading custom datasets, allowing for the analysis of external financial data against theoretical models.

## Technical Stack

- Python: Core logic for simulation and statistical calculations.
- Streamlit: Interactive web-based user interface.
- Pandas & NumPy: High-performance data manipulation and vectorized calculations.
- Plotly/Altair: Dynamic charting for time series visualization.
