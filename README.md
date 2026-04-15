# Thai Bank Holiday Calendar

A web-based calendar application for displaying Thai bank holidays with support for multiple languages (Thai and English) and export functionality.

## Screenshot

![Thai Bank Holiday Calendar](https://raw.githubusercontent.com/narongskml/thai-bank-holiday-ui/refs/heads/main/img/thaibankholiday.png)

## Features

- Interactive calendar view of Thai bank holidays
- Multi-language support (Thai and English)
- Year selection (previos year, current year, next year)
- Export to Excel, PDF, ICS (calendar), and print
- Responsive design

## How to Use

1. Open `index.html` in your web browser
2. Select your preferred language (Thai or English)
3. Choose the year you want to view
4. Click "Generate Calendar" to display the holidays
5. Use the export buttons to save the calendar in different formats:
   - Excel: Export holiday data to spreadsheet
   - PDF: Generate printable calendar
   - ICS: Create calendar file for import into calendar applications
   - Print: Print the current view

## Data Preparation

The holiday data is sourced from the Bank of Thailand (BOT) website (www.bot.or.th). The JSON files in the `data/` directory contain holiday information retrieved from BOT's API.

### Data Structure

Each JSON file contains:
- `result.api`: API endpoint used
- `result.timestamp`: When the data was retrieved
- `result.data[]`: Array of holiday objects with:
  - `Date`: Holiday date (YYYY-MM-DD format)
  - `DateThai`: Date in Thai format
  - `HolidayDescription`: English description
  - `HolidayDescriptionThai`: Thai description
  - `HolidayWeekDay`: Day of the week in English
  - `HolidayWeekDayThai`: Day of the week in Thai

### Updating Data

To update holiday data for new years:

1. Visit the Bank of Thailand website (www.bot.or.th)
2. Access their holiday API or data source
3. Retrieve the holiday information for the desired year
4. Format the data according to the existing JSON structure
5. Save as `data/YYYY.json` (where YYYY is the year)
6. Update the year selection options in `index.html` if needed

## Project Structure

```
thai-bank-holiday-ui/
├── index.html          # Main HTML file
├── css/
│   ├── style.css       # Main stylesheet
│   └── print.css       # Print-specific styles
├── js/
│   └── script.js       # Main JavaScript logic
├── data/
│   ├── 2025.json       # Holiday data for 2025
│   ├── 2026.json       # Holiday data for 2026
│   └── 2027.json       # Holiday data for 2027
├── img/
│   └── logo.png        # Application logo
└── LICENSE             # License file
```

## Dependencies

- SheetJS (xlsx-0.20.3) for Excel export functionality
- Modern web browser with JavaScript enabled

## License

See LICENSE file for details.</content>
