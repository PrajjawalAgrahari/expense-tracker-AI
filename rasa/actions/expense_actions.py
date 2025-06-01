from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests

class ActionQueryExpense(Action):
    def name(self) -> Text:
        return "action_query_expense"

    def get_page_from_message(self, message: str) -> int:
        # Simple logic to detect if user wants next page
        lower_msg = message.lower()
        if any(phrase in lower_msg for phrase in ['next page', 'show more', 'more transactions']):
            return 2  # Return next page
        return 1  # Default to first page

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        try:
            # Get the latest user message
            user_message = tracker.latest_message.get('text')
            
            # Get current page from slots or message
            current_page = tracker.get_slot('current_page') or self.get_page_from_message(user_message)
            
            # Extract Clerk auth token from metadata
            meta = tracker.latest_message.get("metadata", {})
            auth_token = meta.get("X-Clerk-Auth")
            
            # Forward to Next.js server for processing
            headers = {"Content-Type": "application/json"}
            if auth_token:
                headers["Authorization"] = auth_token
            
            response = requests.post(
                'http://localhost:3000/api/expense-query',
                json={
                    'message': user_message,
                    'userId': tracker.sender_id,
                    'page': current_page,
                    'pageSize': 10
                },
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Send the formatted response
                dispatcher.utter_message(text=result['response'])
                
                # Store pagination metadata in slots
                metadata = result.get('metadata', {})
                return [
                    SlotSet("current_page", metadata.get('currentPage')),
                    SlotSet("total_pages", metadata.get('totalPages')),
                    SlotSet("has_more", metadata.get('hasMore')),
                    SlotSet("total_transactions", metadata.get('total'))
                ]
            else:
                dispatcher.utter_message(text="Sorry, I couldn't process your request at the moment.")
                
        except Exception as e:
            print(f"Error forwarding to Next.js: {e}")
            dispatcher.utter_message(text="Sorry, I encountered an error while processing your request.")
        
        return []

class ActionQueryBudget(Action):
    def name(self) -> Text:
        return "action_query_budget"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        try:
            user_message = tracker.latest_message.get('text')
            
            response = requests.post(
                'http://localhost:3000/api/budget-query',
                json={
                    'message': user_message,
                    'userId': tracker.sender_id
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                dispatcher.utter_message(text=result['response'])
            else:
                dispatcher.utter_message(text="Sorry, I couldn't process your budget query at the moment.")
                
        except Exception as e:
            print(f"Error forwarding to Next.js: {e}")
            dispatcher.utter_message(text="Sorry, I encountered an error while processing your budget request.")
        
        return []

class ActionQueryExpenseAnalytics(Action):
    def name(self) -> Text:
        return "action_query_expense_analytics"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        try:
            user_message = tracker.latest_message.get('text')
            
            response = requests.post(
                'http://localhost:3000/api/analytics-query',
                json={
                    'message': user_message,
                    'userId': tracker.sender_id
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                dispatcher.utter_message(text=result['response'])
            else:
                dispatcher.utter_message(text="Sorry, I couldn't process your analytics query at the moment.")
                
        except Exception as e:
            print(f"Error forwarding to Next.js: {e}")
            dispatcher.utter_message(text="Sorry, I encountered an error while processing your analytics request.")
        
        return [] 