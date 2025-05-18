# Bellam Building Checker

A modern web application that makes apartment hunting in New York City transparent and stress-free by providing detailed building analysis and complaint history.

## Features

- **Building Reports**: Comprehensive analysis of building complaints and issues
- **Interactive Map Search**: Find and analyze buildings directly from an interactive map
- **Livability Scores**: AI-powered scoring system based on building history
- **Issue Categories**: Detailed breakdown of building issues by category
- **Monthly Trends**: Track complaint patterns over time
- **Smart Recommendations**: Get actionable insights for each building

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Maps**: Mapbox
- **Data Visualization**: Recharts
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account for database
- Mapbox API key for maps

### Installation

1. Clone the repository
```sh
git clone https://github.com/gsuriya/Bellam-Building-Checker.git
cd Bellam-Building-Checker
```

2. Install dependencies
```sh
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

4. Start the development server
```sh
npm run dev
```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Main application pages
- `/src/utils` - Utility functions and helpers
- `/src/lib` - Third-party service configurations
- `/src/hooks` - Custom React hooks
- `/src/integrations` - External API integrations

## Features in Detail

### Building Analysis
- Comprehensive complaint history
- Livability scoring
- Severity breakdown of issues
- Impact on daily life assessment

### Interactive Search
- Address-based search
- Map-based building selection
- Borough filtering
- Real-time results

### Data Visualization
- Issue categorization
- Monthly trends
- Severity distribution
- Location-specific complaints

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
