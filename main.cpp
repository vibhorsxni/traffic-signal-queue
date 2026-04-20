#include <iostream>
#include <queue>
#include <string>

using namespace std;

// 0=red, 1=yellow, 2=green
enum Light { RED, YELLOW, GREEN };

void printLight(Light l) {
    cout << "\nSignal: ";
    if (l == RED)    cout << "RED - stop\n";
    if (l == YELLOW) cout << "YELLOW - get ready\n";
    if (l == GREEN)  cout << "GREEN - go!\n";
}

void printQueue(queue<string> q) {
    if (q.empty()) {
        cout << "  no vehicles waiting\n";
        return;
    }
    cout << "  front -> ";
    while (!q.empty()) {
        cout << q.front();
        q.pop();
        if (!q.empty()) cout << " | ";
    }
    cout << " <- back\n";
}

int main() {
    queue<string> waitlist;
    Light light = RED;
    int opt;
    string vname;

    cout << "---------------------------\n";
    cout << " traffic signal queue demo\n";
    cout << "---------------------------\n";

    while (true) {
        printLight(light);
        cout << "waiting (" << waitlist.size() << "): \n";
        printQueue(waitlist);

        cout << "\n1. add vehicle\n";
        cout << "2. remove vehicle\n";
        cout << "3. change signal\n";
        cout << "4. quit\n";
        cout << "> ";

        if (!(cin >> opt)) {
            cin.clear();
            cin.ignore(10000, '\n');
            continue;
        }

        if (opt == 1) {
            cout << "vehicle name: ";
            cin >> ws;
            getline(cin, vname);
            if (!vname.empty()) {
                waitlist.push(vname);
                cout << "added " << vname << " to queue\n";
            }
        }
        else if (opt == 2) {
            if (waitlist.empty()) {
                cout << "queue is empty!\n";
            } else if (light != GREEN) {
                cout << "signal isn't green, can't move yet\n";
            } else {
                cout << waitlist.front() << " left the queue\n";
                waitlist.pop();
            }
        }
        else if (opt == 3) {
            light = static_cast<Light>((light + 1) % 3);
        }
        else if (opt == 4) {
            cout << "bye!\n";
            break;
        }
        else {
            cout << "invalid option\n";
        }

        cout << "\n";
    }

    return 0;
}
