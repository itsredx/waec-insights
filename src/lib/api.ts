export const API_BASE_URL = "https://waec-api.onrender.com/";

export interface PredictInput {
  year: number;
  gender: string;
  school_type: string;
  total_sat: number;
}

/*Hi guys! 👋 I volunteered to build the WAEC Insights Project we discussed.

It’s now live! I built a dashboard to visualize the trends, trained a Random Forest model to predict future pass rates, and added an AI assistant so you can 'chat' with the dataset.

Check it out here: https://waec-insights.onrender.com

Let me know what you think about the UI and the predictions! */

export interface PredictResponse {
  predicted_pass_rate: number;
}

export interface ChatInput {
  message: string;
}

export interface DashboardData {
  gender_trend: Array<{ year: number; Male: number; Female: number }>;
  school_performance: Array<{ year: number; Public: number; Private: number }>;
  subject_performance: Array<{ year: number; English: number; Math: number; Both: number }>;
}

export const api = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await fetch(`${API_BASE_URL}/dashboard-data`);
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    return response.json();
  },

  predict: async (data: PredictInput): Promise<PredictResponse> => {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Prediction failed");
    }
    return response.json();
  },

  chat: async (message: string): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
       const errorData = await response.json().catch(() => ({}));
       throw new Error(errorData.detail || "Chat request failed");
    }
    
    if (!response.body) {
         throw new Error("No response body");
    }

    return response.body.getReader();
  }
};
