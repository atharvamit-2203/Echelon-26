import requests
import json
import time

def test_fair_hire_sentinel():
    """Test the Fair-Hire Sentinel system"""
    
    base_url = "http://localhost:8000"
    
    print("🚀 Testing Fair-Hire Sentinel System")
    print("=" * 50)
    
    # Step 1: Populate sample data
    print("\n1. Populating sample data...")
    try:
        response = requests.post(f"{base_url}/api/populate-data")
        if response.status_code == 200:
            print("✅ Sample data populated successfully")
        else:
            print(f"❌ Error populating data: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        print("Make sure the backend server is running on port 8000")
        return
    
    # Step 2: Start batch analysis
    print("\n2. Starting Fair-Hire Sentinel batch analysis...")
    try:
        response = requests.post(f"{base_url}/api/start-batch-analysis")
        if response.status_code == 200:
            print("✅ Batch analysis started")
            result = response.json()
            print(f"   Status: {result.get('status')}")
        else:
            print(f"❌ Error starting analysis: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error starting analysis: {e}")
        return
    
    # Step 3: Wait and check status
    print("\n3. Waiting for analysis to complete...")
    for i in range(10):
        time.sleep(2)
        try:
            response = requests.get(f"{base_url}/api/analysis-status")
            if response.status_code == 200:
                status_data = response.json()
                print(f"   Status check {i+1}/10: {status_data.get('status', 'unknown')}")
                if status_data.get('status') == 'completed':
                    print("✅ Analysis completed!")
                    break
        except Exception as e:
            print(f"   Error checking status: {e}")
    
    # Step 4: Check for rescue alerts
    print("\n4. Checking for rescue alerts...")
    try:
        response = requests.get(f"{base_url}/api/rescue-alerts")
        if response.status_code == 200:
            alerts = response.json().get('rescue_alerts', [])
            if alerts:
                print(f"🚨 Found {len(alerts)} rescue alert(s)!")
                for alert in alerts:
                    print(f"   Alert: {alert.get('title')}")
                    print(f"   Message: {alert.get('description')}")
                    candidates = alert.get('candidates', [])
                    if candidates:
                        print(f"   Rescued candidates: {len(candidates)}")
                        for candidate in candidates:
                            print(f"     - {candidate.get('name')}: {candidate.get('rescue_reason')}")
            else:
                print("ℹ️  No rescue alerts found")
        else:
            print(f"❌ Error checking alerts: {response.text}")
    except Exception as e:
        print(f"❌ Error checking alerts: {e}")
    
    # Step 5: Show final metrics
    print("\n5. Final system metrics...")
    try:
        response = requests.get(f"{base_url}/api/home")
        if response.status_code == 200:
            data = response.json()
            metrics = data.get('metrics', [])
            print("📊 Dashboard Metrics:")
            for metric in metrics:
                print(f"   {metric.get('title')}: {metric.get('value')} ({metric.get('delta')})")
        else:
            print(f"❌ Error getting metrics: {response.text}")
    except Exception as e:
        print(f"❌ Error getting metrics: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Fair-Hire Sentinel Test Complete!")
    print("\nNext steps:")
    print("1. Open http://localhost:3000/dashboard to see the web interface")
    print("2. Click 'Start Fair-Hire Sentinel' to run analysis")
    print("3. Watch for red rescue alerts appearing")
    print("4. Click 'Rescue Now' to save qualified candidates")

if __name__ == "__main__":
    test_fair_hire_sentinel()