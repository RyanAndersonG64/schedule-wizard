"""Creating and retrieving events through the API."""

WEEK = {"start": "2026-11-01T05:00:00Z", "end": "2026-11-08T05:00:00Z"}


def create(client, title, start, end, **extra):
    response = client.post(
        "/api/events",
        json={"title": title, "start_time": start, "end_time": end, **extra},
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_create_returns_event_in_utc(client):
    event = create(
        client, "Coding", "2026-11-04T09:00:00-05:00", "2026-11-04T10:00:00-05:00",
        description="Phase 1",
    )
    assert event["id"] > 0
    assert event["title"] == "Coding"
    assert event["description"] == "Phase 1"
    assert event["start_time"] == "2026-11-04T14:00:00Z"
    assert event["end_time"] == "2026-11-04T15:00:00Z"


def test_create_rejects_invalid_event(client):
    response = client.post(
        "/api/events",
        json={
            "title": "Backwards",
            "start_time": "2026-11-04T10:00:00Z",
            "end_time": "2026-11-04T09:00:00Z",
        },
    )
    assert response.status_code == 422


def test_created_event_can_be_retrieved(client):
    created = create(client, "Coding", "2026-11-04T14:00:00Z", "2026-11-04T15:00:00Z")
    response = client.get("/api/events", params=WEEK)
    assert response.status_code == 200
    assert response.json() == [created]


def test_list_only_returns_events_overlapping_the_range(client):
    create(client, "Last week", "2026-10-28T14:00:00Z", "2026-10-28T15:00:00Z")
    create(client, "Next week", "2026-11-10T14:00:00Z", "2026-11-10T15:00:00Z")
    create(client, "Ends at range start", "2026-11-01T04:00:00Z", "2026-11-01T05:00:00Z")
    create(client, "Starts at range end", "2026-11-08T05:00:00Z", "2026-11-08T06:00:00Z")
    create(client, "Overlaps start", "2026-11-01T03:00:00Z", "2026-11-01T07:00:00Z")
    create(client, "Overlaps end", "2026-11-08T04:00:00Z", "2026-11-08T06:00:00Z")
    create(client, "Inside", "2026-11-04T14:00:00Z", "2026-11-04T15:00:00Z")

    titles = [e["title"] for e in client.get("/api/events", params=WEEK).json()]
    assert titles == ["Overlaps start", "Inside", "Overlaps end"]


def test_list_is_sorted_by_start_time(client):
    create(client, "Later", "2026-11-05T14:00:00Z", "2026-11-05T15:00:00Z")
    create(client, "Earlier", "2026-11-03T14:00:00Z", "2026-11-03T15:00:00Z")
    titles = [e["title"] for e in client.get("/api/events", params=WEEK).json()]
    assert titles == ["Earlier", "Later"]


def test_list_accepts_offsets_in_query(client):
    create(client, "Coding", "2026-11-04T14:00:00Z", "2026-11-04T15:00:00Z")
    response = client.get(
        "/api/events",
        params={"start": "2026-11-04T00:00:00-05:00", "end": "2026-11-05T00:00:00-05:00"},
    )
    assert [e["title"] for e in response.json()] == ["Coding"]


def test_list_requires_a_valid_range(client):
    assert client.get("/api/events").status_code == 422
    backwards = {"start": WEEK["end"], "end": WEEK["start"]}
    assert client.get("/api/events", params=backwards).status_code == 422


def test_delete_removes_the_event(client):
    keep = create(client, "Keep", "2026-11-04T14:00:00Z", "2026-11-04T15:00:00Z")
    remove = create(client, "Remove", "2026-11-05T14:00:00Z", "2026-11-05T15:00:00Z")

    response = client.delete(f"/api/events/{remove['id']}")
    assert response.status_code == 204
    assert response.content == b""

    assert client.get("/api/events", params=WEEK).json() == [keep]


def test_delete_unknown_event_returns_404(client):
    response = client.delete("/api/events/999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Event not found"}


def test_delete_twice_returns_404_the_second_time(client):
    event = create(client, "Coding", "2026-11-04T14:00:00Z", "2026-11-04T15:00:00Z")
    assert client.delete(f"/api/events/{event['id']}").status_code == 204
    assert client.delete(f"/api/events/{event['id']}").status_code == 404

def test_update_saves_updates_correctly(client):
    event = create(client, "Coding", "2026-11-04T14:00:00Z", "2026-11-04T15:00:00Z")
    response = client.put(
        f"/api/events/{event['id']}",
        json={"title": "Coding 2", "start_time": "2026-11-04T14:00:00Z", "end_time": "2026-11-05T15:00:00Z"},
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["id"] == event["id"]
    assert updated["title"] == "Coding 2"
    assert updated["start_time"] == "2026-11-04T14:00:00Z"
    assert updated["end_time"] == "2026-11-05T15:00:00Z"

    assert client.get("/api/events", params=WEEK).json() == [updated]

def test_update_returns_404_for_nonexistent_id(client):
    response = client.put(
        "/api/events/42069",
        json={"title":"HUEHUEHUEHUEHUE","start_time": "2026-11-04T00:00:00-05:00", "end_time": "2026-11-05T00:00:00-05:00"},
    )
    assert response.status_code == 404
    assert response.json() == {"detail" : "Event not found"}

def test_prevent_updates_with_times_in_wrong_order(client):
    event = create(client, "Coding", "2026-11-04T14:00:00Z", "2026-11-04T15:00:00Z")

    response = client.put(
        f"/api/events/{event['id']}",
        json = {
            "title": "ive seen your death it was painful",
            "start_time": "2026-11-04T15:00:00Z",
            "end_time": "2026-11-04T14:00:00Z"
        }
    )
    assert response.status_code == 422
    assert client.get("/api/events", params=WEEK).json() == [event]