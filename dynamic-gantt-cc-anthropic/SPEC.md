We want to create a browser-only application for dynamic project timeline tracking.  Below are the requirements and features, along with implementation details.  Please analyze the specifications below and create a detailed architecture and implementation plan in APP-PLAN.md.  We will use this plan for further implementation so ensure all information required is included in that file, including:
 
* Tech stack and project infrastructure.
* Project file and directory structure organization.
* Testing and logging dependencies.
* Other application dependencies.
* Details on each feature and how to implement it (including algorithms and specific filenames).
* Details on each requirement and how to fulfill it.
* Naming and coding conventions appropriate to the project.
* A granular, overall step-by-step implementation plan with explicit and testable success criteria for each step.
 
Each step of the plan should include explicit build, test, and validation criteria.  These must be satisfied before the step is considered complete.
 
---
 
Overall architectural guidance:
    * Respect KISS and YAGNI principles
    * The application may be served remotely, but should not require interaction with a backend service to function; all logic should run in the browser.
    * The application should be structured as a SPA.
    * Make UI/UX choices that are aesthetically consistent and pleasing.
 
Data elements:
    Tasks
        Have a name, associated team, color theme, percentage completion, and a start and end quarter
    Timelines
        Have a name and a set of associated tasks
    Teams
        Have a name and a set of associated tasks
 
Constraints:
    * Teams may not have the same name as another team
    * Tasks may not have the same name as another task
    * Timelines may not have the same name as another timeline
    * Task completion percentage must be an integer between 0 and 100
    * Names should never have leading or trailing whitespace
 
UI/UX:
    There should be a header line at the top of the application:
        Black background
        Left side
            * Calendar icon in blue on the left side
            * Title ("Dynamic Project Timeline - Quarterly View") in bold type just to the right of the icon.
            * Timeline selection dropdown just to the right of the title, with the list of configured timelines in it.
            * The new timeline button ("+") to add a new timeline to the right of the dropdown.
        Right side
            * The export button with a download icon and "Export" on it.
            * The import button with a download icon and "Import" on it to the right of the export button.
            * The add team button ("+ Add Team") to the right of the import button.
            * The add task button ("+ Add Task") to the right of the add team button at the right side of the screen.
    Below the header should be a quarterly timeline:
        * Left column (fixed, always visible): "Teams", with an appropriate icon.
        * Date columns (Q1 2025 - Q4 - 2028), by quarters, with the quarter designation in bold above the year, which should be in smaller and grayer text
        * Thin gray vertical separators before each year.
    Below the timeline there should be swimlanes for each configured team, stacked vertically.
        * The team name should appear in the first column, under the "Teams" header.
        * The team name should have the number of items associated with it gray text, in parentheses, to the right of the team name.
        * Each swimlane can contain multiple tasks, stacked if they would overlap.  Determine an appropriate algorithm to ensure items are stacked with a minimum of wasted space.  Stacking should be refreshed when editing or adding tasks.
        * Tasks should be rectangles with semicircular ends, with a slightly darker outline around the perimeter for emphasis.
        * Tasks should contain
            * The task name left-justified in the task graphic.
            * The completion percentage right-justified in the task graphic.
            * A thin orange bar should appear at the bottom of the task graphic that visually indicates completion percentage.
                  
    Colors
        "blue" scheme items:
            uncompleted: #3b82f6
            completed: #1e40af
        "indigo" scheme items:
            uncompleted: #6366f1
            completed: #3730a3
        orange: #f97316            
              
    Behavior
        CSS animations should be used to animate repositioning tasks when a new timeline is specified, at a moderate speed (the complete animation should take 2 seconds).  Task name equivalence should determine identity for the purposes of this animation.
        Clicking on a task graphic or on the add task button should bring up a task modal to either edit or insert a new task, as contextually appropriate.  When editing, the dialog should populate with the task's current data:
            * Pen writing icon and "Edit Task" as the left-justified header
            * Edit field labeled "Task Name"
            * Dropdown labeled Team containing the currently-configured team names
            * Dropdown labeled Start Quarter containing "Q1 2025" through "Q4 2028"
            * Dropdown labeled End Quarter containing "Q1 2025" through "Q4 2028"
            * Edit field labeled Progress (%) containing an integer number between 0 and 100 inclusive
            * Dropdown labeled "Color Theme" containing "Blue" and "Indigo"
            * Blue "Update Task" button.  When pressed this should save the added or edited task data.
            * Red button with a trash icon and "Delete".  When pressed this should delete the task (or close the modal without adding, if inserting).
            * White "Cancel" button.  This should close the modal without saving changes.
        Clicking on the new timeline button should bring up a timeline modal to insert a new timeline:
            * Clock icon and "Add New Timeline" as the left-justified header
            * Edit field labeled "Timeline Name"
            * Blue "Save Timeline" button.  When pressed this should save the new timeline.
            * White "Cancel" button.  This should close the modal without saving changes.
        Clicking on the export button should save all the task data for all swimlanes and all timelines in a JSON file using the browser's file interface.  See example below for the appropriate structure.
        Clicking on the import button should allow selection of a JSON file for import using the browser's file interface.  The file should be vetted for correctness.  If it is not correct an error should be displayed an loading aborted.  If it succeeds, overwrite all existing data with the contents of the selected file.
 
A JSON file data format example is below.  It contains two timelines with different numbers of items.  Data can vary between the same items in different timelines:
 
{
  "scenarios": [
    {
      "name": "Main Timeline",
      "tasks": [
        {
          "name": "Onboarding Flow",
          "swimlane": "Pet Fish",
          "startQuarter": "Q1 2025",
          "endQuarter": "Q3 2025",
          "progress": 90,
          "color": "blue"
        },
        {
          "name": "Dispense -- Basic",
          "swimlane": "Pet Fish",
          "startQuarter": "Q3 2025",
          "endQuarter": "Q4 2025",
          "progress": 0,
          "color": "indigo"
        },
        {
          "name": "Signature Capture",
          "swimlane": "Infrastructure",
          "startQuarter": "Q2 2025",
          "endQuarter": "Q4 2025",
          "progress": 0,
          "color": "blue"
        }
      ]
    },
    {
      "name": "Aggressive Timeline",
      "tasks": [
        {
          "name": "Onboarding Flow",
          "swimlane": "Pet Fish",
          "startQuarter": "Q1 2025",
          "endQuarter": "Q2 2025",
          "progress": 100,
          "color": "blue"
        },
        {
          "name": "Signature Capture",
          "swimlane": "Infrastructure",
          "startQuarter": "Q2 2025",
          "endQuarter": "Q4 2025",
          "progress": 0,
          "color": "blue"
        }
      ]
    }
  ],
  "activeScenario": "Main Timeline",
  "swimlanes": [
    "Pet Fish",
    "Infrastructure"
  ],
  "exportDate": "2025-08-26T17:25:25.117Z"
}