<img width="1919" height="819" src="https://github.com/user-attachments/assets/06a11a69-afe0-4b0b-bf94-f4feafbe9c94" />

<br><br>

In this project, we implemented and evaluated multiple machine learning models to predict plant water stress based on environmental data.

We experimented with three different models:

Linear Regression
Decision Tree Regressor
Random Forest Regressor

To compare their performance, we used two evaluation metrics:

Mean Absolute Error (MAE)
R² Score

The results obtained were as follows:

Random Forest → MAE = 2.039, R² ≈ 0.983
Linear Regression → MAE = 2.476, R² ≈ 0.969
Decision Tree → MAE = 2.818, R² ≈ 0.964

Based on these results, the Random Forest model achieved the lowest error and the highest R² score, indicating superior prediction accuracy and better generalization compared to the other models.

Therefore, we selected the Random Forest Regressor as our final model for deployment.

To make the model accessible and usable in a real-world application, we integrated it using FastAPI, a modern and high-performance web framework for building APIs with Python. FastAPI allowed us to expose the trained model as an API endpoint, enabling users or external systems to send environmental data and receive real-time predictions of plant water stress efficiently. <br>

<img width="1481" height="845" alt="Screenshot 2026-04-15 112146" src="https://github.com/user-attachments/assets/99be7856-56f7-4af2-989f-06138e2016b6" />


<br><br>

⚠️ Water Stress Prediction Examples

<br><br>

<img width="955" height="688" src="https://github.com/user-attachments/assets/e559f07a-8e42-404a-bed9-3a21af1f8642" />

<br><br><br><br>

<img width="950" height="714" src="https://github.com/user-attachments/assets/8fdad36a-36f4-42b4-8607-5a45feae6e1b" />

<br><br>
<img width="980" height="733" alt="Screenshot 2026-04-15 112907" src="https://github.com/user-attachments/assets/e5a38823-78c3-41fe-9263-0efc35b79d88" />



