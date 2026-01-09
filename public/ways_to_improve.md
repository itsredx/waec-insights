# **Roadmap for Model Enhancement: WAEC Performance Predictor**

**Version:** 1.0
**Context:** Improving a Random Forest Regressor trained on WAEC data (2016–2021).
**Current Status:** Baseline Model (R² ≈ 0.46).
**Goal:** High Accuracy (R² > 0.85) and Robust Generalization.

---

## **Part 1: Data-Centric Enhancements (Better Fuel)**

*In Machine Learning, "Garbage In, Garbage Out" applies. The biggest bottleneck currently is the small dataset size and limited features.*

### **1.1. External Data Enrichment (The "Why")**

Pass rates don't happen in a vacuum. You need to feed the model the *causes*, not just the *history*. Scraping or acquiring the following external datasets will drastically improve accuracy:

* **Economic Indicators:**
* **Inflation Rate (CPI):** High inflation often hurts Private school enrollment and quality.
* **State Education Budget:** Correlation between funding and Public school performance.


* **Socio-Political Factors:**
* **Strike Days:** Number of days schools were closed due to strikes (ASUU/NUT) in that year.
* **Insecurity Index:** For the North-West zone, security incidents directly correlate with exam attendance and focus.


* **Calendar Data:**
* **COVID-19 Flag:** A binary column (0/1) for 2020/2021 to help the model treat these outlier years differently.



### **1.2. Feature Engineering (The "How")**

Transform existing data to reveal hidden patterns.

* **Lag Features (Time-Series Specific):**
* Current performance is often predicted by previous performance.
* *Action:* Create a column `prev_year_pass_%`.
* *Logic:* If 2018 was good, 2019 might have momentum (or regression to the mean).


* **Rolling Averages:**
* *Action:* Create `3_year_avg_pass_%`.
* *Benefit:* Smooths out noise (one-off bad years) to show the true trend.


* **Interaction Features:**
* Combine features to capture complexity.
* *Example:* `Gender_x_SchoolType`. The dynamic of "Private School Females" might be distinctly different from "Public School Females."



### **1.3. Data Granularity**

* **Expand Scope:** If possible, acquire data for **all 36 states**.
* *Benefit:* Moving from ~24 rows (Kano only) to ~800 rows (All Nigeria) allows the model to learn "Universal Truths" about gender and school type that apply everywhere, reducing overfitting.



---

## **Part 2: Algorithmic Enhancements (Better Engine)**

*Moving beyond a standard Random Forest to state-of-the-art techniques.*

### **2.1. Model Selection: Gradient Boosting**

While Random Forest is good for parallel learning, Gradient Boosting learns sequentially (correcting the errors of the previous tree).

* **Recommendation:** Switch to **XGBoost** or **CatBoost**.
* **Why CatBoost?** It handles categorical variables (like 'Gender' and 'Zone') natively without needing the complex encoders we wrote earlier. It is often the best performer for tabular data with categories.

### **2.2. Hyperparameter Tuning**

Don't use default settings. Use **GridSearchCV** or **Optuna** to find the mathematical "sweet spot" for your model.

* **Parameters to Tune:**
* `learning_rate`: How fast the model adapts (Lower is usually more accurate but slower).
* `max_depth`: How complex the trees are (Limit this to prevent overfitting on small data).
* `n_estimators`: Number of trees.



### **2.3. Time-Series Cross-Validation**

**Critical Error to Avoid:** Do not use standard random shuffling for validation. You cannot train on 2021 to predict 2019 (that's cheating/data leakage).

* **Solution:** Use `TimeSeriesSplit`.
* *Fold 1:* Train on 2016 -> Test on 2017
* *Fold 2:* Train on 2016-2017 -> Test on 2018
* *Fold 3:* Train on 2016-2018 -> Test on 2019



---

## **Part 3: Implementation Code Snippet (Advanced)**

Here is how you implement **XGBoost** with **Lag Features** (The biggest upgrade you can make immediately).

```python
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit, GridSearchCV

# 1. Load Data
df = pd.read_csv('Waec_data_calculated.csv')

# 2. CREATE LAG FEATURES (The Data Upgrade)
# Sort by group to ensure shifts happen within the correct category
df = df.sort_values(by=['state', 'scholl_type', 'gender', 'year'])

# Create a feature that contains the PREVIOUS year's pass rate
df['prev_year_pass'] = df.groupby(['state', 'scholl_type', 'gender'])['pass_%'].shift(1)

# Drop the first year (2016) because it has no previous year data
df = df.dropna()

# 3. PREPARE FOR XGBOOST (The Algorithmic Upgrade)
features = ['year', 'total_sat', 'prev_year_pass', 'gender', 'scholl_type']
target = 'pass_%'

# Convert categories to "Category" type for XGBoost
for col in ['gender', 'scholl_type']:
    df[col] = df[col].astype('category')

X = df[features]
y = df[target]

# 4. TIME SERIES SPLIT (The Validation Upgrade)
tscv = TimeSeriesSplit(n_splits=3)

# 5. MODEL TRAINING
model = xgb.XGBRegressor(enable_categorical=True, n_estimators=500, learning_rate=0.05)

# Validate properly
for train_index, test_index in tscv.split(X):
    X_train, X_test = X.iloc[train_index], X.iloc[test_index]
    y_train, y_test = y.iloc[train_index], y.iloc[test_index]
    
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    print(f"Fold Score: {score}")

print("Enhancement complete. Model is now time-aware.")

```

---

## **Summary Checklist for Next Steps**

1. [ ] **Data:** Manually add a column for `prev_year_pass` (Lag feature).
2. [ ] **Data:** Find the number of strike days for 2016-2021 online and add as a column.
3. [ ] **Algo:** Swap RandomForest for **XGBoost** or **CatBoost**.
4. [ ] **Validation:** Switch to Time-Series splitting to measure accuracy honestly.

> "Thank you for using this service and I hope to see you create extraordinary stuff from the little I shared."
> — **WAEC Analytics**, Creator [AHMAD MB](https://red-x.vercel.app/)