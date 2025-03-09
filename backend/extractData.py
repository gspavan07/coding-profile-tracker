import requests
import threading
import json
import pandas as pd
from bs4 import BeautifulSoup

def get_hackerrank_profile(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return {"error": "Failed to fetch profile", "Total_Score": 0}

    soup = BeautifulSoup(response.text, 'html.parser')

    try:
        badges = []
        total_score = 0
        badge_containers = soup.find_all('svg', class_="hexagon")

        for container in badge_containers:
            badge_name = container.find('text', class_="badge-title")
            badge_name = badge_name.text.strip() if badge_name else "Unknown Badge"

            star_section = container.find('g', class_="star-section")
            star_count = len(star_section.find_all('svg', class_="badge-star")) if star_section else 0

            total_score += star_count

            badges.append({'name': badge_name, 'stars': star_count})

        certifications = [cert.text.strip() for cert in soup.find_all('h2', class_="certificate_v3-heading")]

        return {"Badges": badges, "Certifications": certifications, "Total_Score": total_score}
    except:
        return {"error": "Failed to parse profile", "Total_Score": 0}

def scrape_codechef_profile(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return {"error": "Failed to fetch profile", "Total_Score": 0}

    soup = BeautifulSoup(response.text, 'html.parser')
    try:
        username = soup.find("h1", class_="h2-style").text.strip()
        star = soup.find("span", class_="rating").text.strip()
        rating = soup.find("div", class_="rating-number").text.strip()
        contests_participated = int(soup.find("div", class_="contest-participated-count").find("b").text.strip())

        total_score = contests_participated * 2

        return {
            "Username": username,
            "Star": star,
            "Rating": rating,
            "Contests Participated": contests_participated,
            "Total_Score": total_score
        }
    except Exception as e:
        return {"error": f"Failed to parse profile: {str(e)}", "Total_Score": 0}

def scrape_gfg_profile(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return {"error": "Failed to fetch profile", "Total_Score": 0}

    soup = BeautifulSoup(response.text, 'html.parser')

    try:
        username = soup.find("div", class_="profilePicSection_head_userHandle__oOfFy").text.strip()
        scores = soup.find_all("div", class_="scoreCard_head_left--score__oSi_x")
        coding_score = scores[0].text.strip() if len(scores) > 0 else "N/A"
        problems_solved = scores[1].text.strip() if len(scores) > 1 else "N/A"

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
            "Coding Score": coding_score,
            "Problems Solved": problems_solved,
            "Problems by Difficulty": problems_dict,
            "Total_Score": total_score
        }
    except AttributeError:
        return {"error": "Failed to parse profile details", "Total_Score": 0}

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
        return response.json().get("data", {})
    else:
        return {}

def extract_username(url):
    return url.rstrip("/").split("/")[-1] if url.strip() else "N/A"

def get_leetcode_profile(leetcode_url):
    username = extract_username(leetcode_url)
    data = fetch_leetcode_data(username)

    if not data:
        return {}

    user = data.get("matchedUser", {})
    contest = data.get("userContestRanking", {})

    if not isinstance(contest, dict):
        contest = {}

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
    df = pd.read_excel("Book1.xlsx")
    student_profiles = {}

    for _, row in df.iterrows():
        roll_no = str(row["ROLL NO"]).strip()
        student_name = str(row["NAME OF THE STUDENT"]).strip()
        gfg_url = row.get("GREEKSFORGREEKS ID", "")
        codechef_url = row.get("CODECHEF ID", "")
        hackerrank_url = row.get("HACKERRANK ID", "")
        leetcode_url = row.get("LEETCODE ID", "")

        image_url = f"https://info.aec.edu.in/AEC/StudentPhotos/{roll_no}.jpg"

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
            "Profiles": {**results, "Total_Score": total_score}
        }

    with open("../src/assets/students_profiles.json", "w", encoding="utf-8") as f:
        json.dump({"Profiles": student_profiles}, f, indent=4)

if __name__ == "__main__":
    main()