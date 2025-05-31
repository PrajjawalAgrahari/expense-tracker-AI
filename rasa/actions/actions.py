from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
import datetime
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# NextJS API endpoint
NEXTJS_API_URL = os.getenv('NEXTJS_API_URL', 'http://localhost:3000/api')

class ActionAddExpense(Action):
    def name(self) -> Text:
        return "action_add_expense"
    
    def format_response_message(self, amount, category, date, description=None):
            formatted_category = category.lower().replace('-', ' ').title()
            
            try:
                formatted_date = datetime.datetime.strptime(date, '%Y-%m-%d').strftime('%b %d, %Y')
            except:
                formatted_date = date
            
            response_message = f"✅ Expense added: ${amount:.2f} for {formatted_category} on {formatted_date}"
            
            if description and description.strip():
                response_message += f" ({description.strip()})"

            return response_message

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Extract Clerk auth token from metadata
        meta = tracker.latest_message.get("metadata", {})
        auth_token = meta.get("X-Clerk-Auth")
        
        # Get the raw message text
        message_text = tracker.latest_message.get("text", "")
        
        if not message_text:
            dispatcher.utter_message(text="I couldn't understand your expense. Please try again.")
            return []
        
        # Prepare data for NextJS API - just send the raw message
        expense_data = {
            "message": message_text,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        # Send request to NextJS API endpoint
        try:
            # Setup headers with content type and auth if available
            headers = {
                "Content-Type": "application/json"
            }
            
            # Add auth header if it exists
            if auth_token:
                headers["Authorization"] = auth_token
                print("Using auth header:", auth_token[:20] + "..." if auth_token else "None")
            else:
                print("No auth header found in metadata")
                print("Available metadata:", meta)
            
            print("Request data:", expense_data)
            print("API URL:", f"{NEXTJS_API_URL}/expenses")
            print("Headers:", {k: v[:20] + "..." if k == "Authorization" and v else v for k, v in headers.items()})
            
            response = requests.post(
                f"{NEXTJS_API_URL}/expenses",
                json=expense_data,
                headers=headers
            ) 
            
            if response.status_code in [200, 201]:
                # Success - expense processed by the API
                response_data = response.json()
                
                # Display a confirmation message using the processed data from the API
                if "data" in response_data:
                    data = response_data["data"]
                    amount = float(data.get("amount", 0))  # <- Convert to float here
                    category = data.get("category", "unknown")
                    date = data.get("date", datetime.datetime.now().strftime('%Y-%m-%d'))
                    description = data.get("description", "")

                    
                    response_message = self.format_response_message(amount, category, date, description)
                    
                    dispatcher.utter_message(text=response_message)
                else:
                    # Generic success message if no detailed data is returned
                    dispatcher.utter_message(text="Your expense has been recorded successfully.")
                
                # Clear slots after successful addition
                return [
                    SlotSet("amount", None),
                    SlotSet("category", None),
                    SlotSet("date", None),
                    SlotSet("description", None),
                    SlotSet("requested_slot", None)
                ]
            else:
                # API error
                print("API error response:", response.text)
                dispatcher.utter_message(text=f"Sorry, I couldn't save your expense. API returned status {response.status_code}.")
        
        except Exception as e:
            print("Exception in API call:", str(e))
            dispatcher.utter_message(text=f"Sorry, I couldn't save your expense: {str(e)}")
        
        return []