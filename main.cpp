#include <iostream>
#include <queue>
#include <string>

using namespace std;

enum SignalState { RED, YELLOW, GREEN };

void displaySignal(SignalState state) {
    cout << "\n[TRAFFIC SIGNAL]: ";
    switch (state) {
        case RED:    cout << "🔴 RED (STOP)\n"; break;
        case YELLOW: cout << "🟡 YELLOW (CAUTION)\n"; break;
        case GREEN:  cout << "🟢 GREEN (GO)\n"; break;
    }
}

void showQueue(queue<string> q) {
    if (q.empty()) {
        cout << "(Queue is empty)\n";
        return;
    }
    cout << "FRONT -> ";
    while (!q.empty()) {
        cout << "[" << q.front() << "] ";
        q.pop();
    }
    cout << "<- REAR\n";
}

int main() {
    queue<string> vehicles;
    SignalState signal = RED;
    int choice;
    string vehicleName;

    cout << "====================================\n";
    cout << "  Traffic Signal Queue Management   \n";
    cout << "====================================\n";

    while (true) {
        displaySignal(signal);
        cout << "\nCurrent Queue (" << vehicles.size() << "): \n";
        showQueue(vehicles);
        
        cout << "\nOptions:\n";
        cout << "1. Enqueue vehicle (Arrival)\n";
        cout << "2. Dequeue vehicle (Departure)\n";
        cout << "3. Cycle Signal (Red -> Yellow -> Green)\n";
        cout << "4. Exit\n";
        cout << "Enter choice: ";
        
        if (!(cin >> choice)) {
            cin.clear();
            cin.ignore(10000, '\n');
            continue;
        }

        switch (choice) {
            case 1:
                cout << "Enter vehicle name (e.g. Car, Bus): ";
                cin >> ws; // clear whitespace
                getline(cin, vehicleName);
                if (!vehicleName.empty()) {
                    vehicles.push(vehicleName);
                    cout << ">>> Enqueued: " << vehicleName << "\n";
                }
                break;
            case 2:
                if (vehicles.empty()) {
                    cout << ">>> Queue is empty! No vehicles to dequeue.\n";
                } else if (signal != GREEN) {
                    cout << ">>> Traffic violation! Signal is NOT green. Cannot depart.\n";
                } else {
                    cout << ">>> Dequeued: " << vehicles.front() << " departed standardly.\n";
                    vehicles.pop();
                }
                break;
            case 3:
                signal = static_cast<SignalState>((signal + 1) % 3);
                cout << ">>> Signal cycled.\n";
                break;
            case 4:
                cout << "Exiting system. Goodbye!\n";
                return 0;
            default:
                cout << ">>> Invalid choice. Please try again.\n";
        }
    }

    return 0;
}
