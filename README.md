# 🔮 Drole Market

**Drole Market** is a decentralized prediction market platform simulator. It allows users to trade shares on the outcome of future events—ranging from Crypto and Politics to Sports and Pop Culture.

Beyond standard trading, this project integrates **AI** to provide real-time sentiment analysis and market insights, giving traders an edge in understanding the "vibe" of a market.

![Project Preview]

## 🚀 Key Features

*   **📈 Real-Time Trading Simulation:** Experience dynamic price fluctuations, volume updates, and interactive price history charts.
*   **🧠 AI Market Pulse:** Integrated with Google Gemini to provide instant market summaries, sentiment scores (Bullish vs. Bearish), and risk analysis.
*   **💼 Portfolio Management:** Track your positions, calculate Profit & Loss (P&L), and view trade history in a clean dashboard.
*   **💬 Social Integration:** Market-specific chat rooms allowing users to discuss strategies and react to price movements.
*   **🔗 Web3 Wallet Integration:** Simulated wallet connection flow, balance management, and transaction signing.
*   **🎨 Modern UI/UX:** A responsive, dark-mode-first design built with Tailwind CSS for a seamless desktop and mobile experience.

## 🛠️ Tech Stack

*   **Frontend:** React (v19), TypeScript
*   **Styling:** Tailwind CSS
*   **AI:** Google Gemini API (`@google/genai`)
*   **Visualization:** Recharts (Interactive Line Charts)
*   **Icons:** Lucide React

## 📦 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/David35478/Drole-market.git
    cd drole-market
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```

## 🔮 How It Works

1.  **Connect Wallet:** Click "Connect" to simulate linking a Web3 wallet. You will receive mock funds to test the platform.
2.  **Choose a Market:** Browse trending events (e.g., "Will Bitcoin hit $150k?").
3.  **Analyze:** Use the **AI Pulse** tab to get a Gemini-generated summary of the market odds and news factors.
4.  **Trade:** Buy "Yes" or "No" shares. Prices fluctuate based on simulated supply and demand.
5.  **Track:** Visit the Portfolio page to see your current holdings and return on investment.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for new features or improvements.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
