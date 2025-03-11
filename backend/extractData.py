import requests
import json
import pandas as pd
from bs4 import BeautifulSoup
import threading

def extract_branch(roll_no):
    branch_codes = {"61": "AIML", "44": "DS", "05": "CSE", "04": "ECE", "12": "IT", "MC": "MCA"}

    branch_code_7_8 = roll_no[6:8]  # Extracting the 7th and 8th letter
    branch_code_6_7 = roll_no[5:7]  # Extracting the 6th and 7th letter for MCA

    if branch_code_6_7 == "MC":
        return "MCA"
    return branch_codes.get(branch_code_7_8, "Unknown")

def get_hackerrank_profile(url):
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code != 200:
            return {"error": "Invalid URL", "Total Score": 0}

        soup = BeautifulSoup(response.text, 'html.parser')

        badges = []
        total_score = 0

        badge_containers = soup.find_all('svg', class_="hexagon")

        for container in badge_containers:
            badge_name_tag = container.find('text', class_="badge-title")
            badge_name = badge_name_tag.text.strip() if badge_name_tag else "Unknown Badge"

            star_section = container.find('g', class_="star-section")
            star_count = len(star_section.find_all('svg', class_="badge-star")) if star_section else 0

            total_score += star_count
            badges.append({'name': badge_name, 'stars': star_count})

        certifications = [cert.text.strip() for cert in soup.find_all('h2', class_="certificate_v3-heading")]

        if not badges and not certifications:
            return {
                "Username": extract_username(url),
                "Coding_Score": "__",
                "Problems_Solved": "__",
                "Problems_by_Difficulty": {"Easy": 0, "Medium": 0, "Hard": 0, "Total": 0},
                "Total_Score": 0
            }

        return {"Badges": badges, "Certifications": certifications, "Total Score": total_score}

    except requests.exceptions.RequestException:
        return {"error": "Invalid URL", "Total Score": 0}

    except Exception:
        return {
            "Username": "unknown",
            "Coding_Score": "__",
            "Problems_Solved": "__",
            "Problems_by_Difficulty": {"Easy": 0, "Medium": 0, "Hard": 0, "Total": 0},
            "Total_Score": 0
        }

def scrape_codechef_profile(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return {"error": "Failed to fetch profile", "Total_Score": 0}

    soup = BeautifulSoup(response.text, 'html.parser')
    try:
        username = soup.find("span", class_="m-username--link").text.strip()
        star = soup.find("span", class_="rating").text.strip()
        rating = soup.find("div", class_="rating-number").text.strip()
        contests_participated = int(soup.find("div", class_="contest-participated-count").find("b").text.strip())

        total_score = contests_participated * 2

        return {
            "Username": username,
            "Star": star,
            "Rating": rating,
            "Contests_Participated": contests_participated,
            "Total_Score": total_score
        }
    except Exception as e:
        return {
            "Username": extract_username(url),
            "Coding_Score": "__",
            "Problems_Solved": "__",
            "Problems_by_Difficulty": {"Easy": 0, "Medium": 0, "Hard": 0, "Total": 0},
            "Total_Score": 0
        }

def is_url_accessible(url):
    """Check if the GFG profile URL is accessible."""
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            return response
        print(f" GFG URL is not accessible (Status Code: {response.status_code})")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Request error while checking URL: {e}")
        return None

def scrape_gfg_profile(url):
    """Scrape a user's GeeksforGeeks profile for coding statistics."""
    response = is_url_accessible(url)
    if not response:
        return {"Invalid URL"}

    soup = BeautifulSoup(response.text, 'html.parser')

    try:
        # Extract username
        username_tag = soup.find("div", class_="profilePicSection_head_userHandle__oOfFy")
        if not username_tag:
            raise ValueError("Username not found in profile")

        username = username_tag.text.strip()

        # Extract coding score and problems solved
        scores = soup.find_all("div", class_="scoreCard_head_left--score__oSi_x")
        coding_score = scores[0].text.strip() if len(scores) > 0 else "N/A"
        problems_solved = scores[1].text.strip() if len(scores) > 1 else "N/A"

        # Extract problem counts
        problem_counts = soup.find_all("div", class_="problemNavbar_head_nav--text__UaGCx")
        problems_dict = {"Easy": 0, "Medium": 0, "Hard": 0, "Total": 0}

        for problem in problem_counts:
            text = problem.text.strip()
            if "(" in text and ")" in text:
                category, count = text.rsplit(" (", 1)
                count = int(count.rstrip(")"))
                if category.strip().upper() == "EASY":
                    problems_dict["Easy"] = count
                elif category.strip().upper() == "MEDIUM":
                    problems_dict["Medium"] = count
                elif category.strip().upper() == "HARD":
                    problems_dict["Hard"] = count

        problems_dict["Total"] = problems_dict["Easy"] + problems_dict["Medium"] + problems_dict["Hard"]
        total_score = (problems_dict["Easy"] * 1) + (problems_dict["Medium"] * 2) + (problems_dict["Hard"] * 3)

        return {
            "Username": username,
            "Coding_Score": coding_score,
            "Problems_Solved": problems_solved,
            "Problems_by_Difficulty": problems_dict,
            "Total_Score": total_score
        }

    except ValueError as ve:
        print(f"Data Parsing Error: {ve}")
        return {"error": str(ve)}

    except AttributeError:
        print("details not found .")
        return {"Failed to parse profile details"}

    except Exception as e:
        print(f"Unexpected Error: {e}")
        return {"An unexpected error occurred"}
    
# Define the LeetCode GraphQL API endpoint
URL = "https://leetcode.com/graphql"

def fetch_leetcode_data(username):
    query = """
    {
      matchedUser(username: "%s") {
        submitStats {
          totalSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
        }
      }

      userContestRanking(username: "%s") {
        attendedContestsCount
        rating
      }
    }
    """ % (username, username)

    response = requests.post(URL, json={"query": query})

    if response.status_code == 200:
        data = response.json()
        if "errors" in data:
            raise ValueError("Invalid URL or username not found.")
        return data.get("data", {})
    else:
        raise ConnectionError("Failed to fetch data from LeetCode API.")

def extract_username(url):
    return url.rstrip("/").split("/")[-1] if url.strip() else "N/A"

def get_leetcode_profile(leetcode_url):
    username = extract_username(leetcode_url)

    try:
        data = fetch_leetcode_data(username)
    except ValueError as ve:
        return {"Error": str(ve)}
    except ConnectionError as ce:
        return {"Error": str(ce)}

    if not data:
        return {"Error": "No data found for the given username."}

    user = data.get("matchedUser", {})
    contest = data.get("userContestRanking")

    # Ensure contest is a dictionary
    if not isinstance(contest, dict):
        contest = {}

    if not user and not contest:
        return {
            "Username": username,
            "Coding_Score": "__",
            "Problems_Solved": "__",
            "Problems_by_Difficulty": {"Easy": 0, "Medium": 0, "Hard": 0, "Total": 0},
            "Total_Score": 0
        }

    total_problems = {submission['difficulty']: submission['count'] for submission in user.get("submitStats", {}).get("totalSubmissionNum", [])}

    problems = {
        "Easy": total_problems.get("Easy", 0),
        "Medium": total_problems.get("Medium", 0),
        "Hard": total_problems.get("Hard", 0),
        "Total": total_problems.get("All", 0)
    }

    total_score = (problems["Easy"] * 1) + (problems["Medium"] * 2) + (problems["Hard"] * 3) + (contest.get("attendedContestsCount", 0) * 2)

    return {
        "Username": username,
        "Problems": problems,
        "Total_Score": total_score,
        "Contests Attended": contest.get("attendedContestsCount", 0),
        "Rating": contest.get("rating", 0)
    }

def fetch_profile_data(url, fetch_function, results, key):
    results[key] = fetch_function(url) if pd.notna(url) else {}

def main():
    df = pd.read_excel("Book1 (1).xlsx")
    student_profiles = {}

    for _, row in df.iterrows():
        roll_no = str(row["ROLL NO"]).strip()
        student_name = str(row["NAME OF THE STUDENT"]).strip()
        gfg_url = row.get("GREEKSFORGREEKS ID", "")
        codechef_url = row.get("CODECHEF ID", "")
        hackerrank_url = row.get("HACKERRANK ID", "")
        leetcode_url = row.get("LEETCODE ID", "")

        image_url = f"https://info.aec.edu.in/AEC/StudentPhotos/{roll_no}.jpg"
        branch = extract_branch(roll_no)


        results = {}
        threads = [
            threading.Thread(target=fetch_profile_data, args=(gfg_url, scrape_gfg_profile, results, "GeeksForGeeks")),
            threading.Thread(target=fetch_profile_data, args=(codechef_url, scrape_codechef_profile, results, "CodeChef")),
            threading.Thread(target=fetch_profile_data, args=(hackerrank_url, get_hackerrank_profile, results, "HackerRank")),
            threading.Thread(target=fetch_profile_data, args=(leetcode_url, get_leetcode_profile, results, "LeetCode"))
        ]

        for thread in threads:
            thread.start()

        for thread in threads:
            thread.join()

        total_score = sum(profile.get("Total_Score", 0) for profile in results.values())

        student_profiles[roll_no] = {
            "Name": student_name,
            "Image": image_url,
            "Branch": branch,

            "Profiles": {**results, "Total_Score": total_score}
        }

    with open("students_profiles.json", "w", encoding="utf-8") as f:
        json.dump({"Profiles": student_profiles}, f, indent=4)

if __name__ == "__main__":
    main()